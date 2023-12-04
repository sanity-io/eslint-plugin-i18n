import type { TSESTree } from '@typescript-eslint/typescript-estree';
import type ESLint from 'eslint';

export interface RuleOptions {
  /**
   * This is the primary filter used to specify exceptions or conditions for
   * which attributes should not be reported. Attributes matching its conditions
   * are excluded from being reported.
   *
   * If the `only` option is present with `ignores`, the `only` option will
   * determine which attributes to consider and then the `ignores` option is
   * used to ignore any attributes that match.
   */
  ignores?: InputOption;
  /**
   * If specified, only attributes matching its conditions will be considered.
   * If omitted, all attributes are initially selected.
   *
   * If the `only` option is present with `ignores`, the `only` option will
   * determine which attributes to consider and then the `ignores` option is
   * used to ignore any attributes that match.
   */
  only?: InputOption;

  /**
   * If the mode is specified as `override` the default configuration for
   * `ignores` and `only` will be overridden by the user configuration.
   *
   * The default behavior is to `extend`.
   */
  mode?: 'extend' | 'override';
}

export type InputOption =
  | undefined
  | { and: InputOption[] }
  | { or: InputOption[] }
  | { not: InputOption }
  | {
      /**
       * List of attributes to match.
       *
       * For instance, to match the attribute `foo` in `<Component foo="text" />`,
       * add "foo" to this list.
       */
      attributes?: string[];

      /**
       * Regex patterns for attribute names. (case insensitive)
       *
       * E.g., to match all `data-` attributes in `<Component data-testid="a" />`,
       * use the pattern "^data-\w+".
       */
      attributePatterns?: string[];

      /**
       * List of string literals or template element values to match.
       *
       * For instance, to match the value `hello ` in `<Component text={`hello ${name}`} />`,
       * add `'hello '` to this list.
       */
      values?: string[];

      /**
       * Regex patterns to match string literals or template element values.
       * (case insensitive)
       *
       * For instance, to match the value `id:` in `<Component text={`id:${name}`} />`,
       * add `'id:'` to this list.
       */
      valuePatterns?: string[];

      /**
       * List of component names to match.
       *
       * For instance, to match the `<Button />` component,
       * add "Button" to this list.
       */
      components?: string[];

      /**
       * Regex patterns for component names. (case insensitive)
       *
       * E.g., to match any component with "Btn" in its name like `<SubmitBtn />` or `<CancelBtn />`,
       * use the pattern ".*btn".
       */
      componentPatterns?: string[];
    };

const option = 'InputOption';
const $ref = `#/definitions/${option}`;

export const schema: ESLint.Rule.RuleMetaData['schema'] = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      ignores: { oneOf: [{ $ref }, { type: 'array', items: { $ref } }] },
      only: { oneOf: [{ $ref }, { type: 'array', items: { $ref } }] },
      mode: { type: 'string', enum: ['extend', 'override'] },
    },
    additionalProperties: false,
  },
  definitions: {
    [option]: {
      oneOf: [
        {
          type: 'object',
          properties: { and: { type: 'array', items: { $ref } } },
          required: ['and'],
        },
        {
          type: 'object',
          properties: { or: { type: 'array', items: { $ref } } },
          required: ['or'],
        },
        {
          type: 'object',
          properties: { not: { $ref } },
          required: ['not'],
        },
        {
          type: 'object',
          properties: {
            attributes: { type: 'array', items: { type: 'string' } },
            attributePatterns: { type: 'array', items: { type: 'string' } },
            values: { type: 'array', items: { type: 'string' } },
            valuePatterns: { type: 'array', items: { type: 'string' } },
            components: { type: 'array', items: { type: 'string' } },
            componentPatterns: { type: 'array', items: { type: 'string' } },
          },
          additionalProperties: false,
        },
      ],
    },
  },
};

export function getAttributeName(node: TSESTree.JSXAttribute) {
  return node.name.type === 'JSXNamespacedName'
    ? `${node.name.namespace.name}:${node.name.name.name}`
    : node.name.name;
}

const valueMatches = (value: string) => (pattern: string) =>
  new RegExp(pattern, 'i').test(value);

interface AttributeEntry {
  component: string;
  name: string;
  value: string;
  node: TSESTree.Node;
}

export function evaluate(input: InputOption, attr: AttributeEntry): boolean {
  if (!input) return false;

  if ('and' in input) {
    return input.and
      .filter((expr) => !expressionIsEmpty(expr))
      .every((item) => evaluate(item, attr));
  }
  if ('or' in input) {
    return input.or
      .filter((expr) => !expressionIsEmpty(expr))
      .some((item) => evaluate(item, attr));
  }
  if ('not' in input) {
    return !evaluate(input.not, attr);
  }

  const {
    attributePatterns,
    attributes,
    componentPatterns,
    components,
    valuePatterns,
    values,
  } = input;

  if (attributes?.some((name) => attr.name === name)) return true;
  if (attributePatterns?.some(valueMatches(attr.name))) return true;

  if (components?.some((comp) => attr.component === comp)) return true;
  if (componentPatterns?.some(valueMatches(attr.component))) return true;

  if (values?.some((value) => attr.value === value)) return true;
  if (valuePatterns?.some(valueMatches(attr.value))) return true;

  return false;
}

export function expressionIsEmpty(input: InputOption): boolean {
  if (!input) return true;

  if ('and' in input) return input.and.every(expressionIsEmpty);
  if ('or' in input) return input.or.every(expressionIsEmpty);
  if ('not' in input) return expressionIsEmpty(input.not);

  if (input.attributePatterns?.length) return false;
  if (input.attributes?.length) return false;
  if (input.componentPatterns?.length) return false;
  if (input.components?.length) return false;
  if (input.valuePatterns?.length) return false;
  if (input.values?.length) return false;
  return true;
}

export function getComponentName(node: TSESTree.JSXTagNameExpression): string {
  switch (node.type) {
    case 'JSXIdentifier': {
      return node.name;
    }
    case 'JSXMemberExpression': {
      return `${getComponentName(node.object)}.${getComponentName(
        node.property,
      )}`;
    }
    case 'JSXNamespacedName': {
      return `${getComponentName(node.namespace)}:${getComponentName(
        node.name,
      )}`;
    }
    default: {
      return '';
    }
  }
}
