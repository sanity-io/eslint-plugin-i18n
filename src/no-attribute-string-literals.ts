import type { TSESTree } from '@typescript-eslint/typescript-estree';
import type ESLint from 'eslint';
import { defaultNoAttributeStringLiteralsOptions } from './defaults';
import {
  InputOption,
  RuleOptions,
  evaluate,
  expressionIsEmpty,
  getAttributeName,
  getComponentName,
  schema,
} from './common';

/**
 * Pulls literal values from expressions recursively
 */
function getStringLiteralsFromExpression(
  expression: TSESTree.Expression,
): Array<TSESTree.StringLiteral | TSESTree.TemplateLiteral> {
  // supports reaching into conditional expressions (i.e. ternary ? : expressions)
  if (expression.type === 'ConditionalExpression') {
    return [
      ...getStringLiteralsFromExpression(expression.consequent),
      ...getStringLiteralsFromExpression(expression.alternate),
    ];
  }

  // supports reaching into logical expressions (e.g. value ?? 'fallback')
  if (expression.type === 'LogicalExpression') {
    return [
      ...getStringLiteralsFromExpression(expression.left),
      ...getStringLiteralsFromExpression(expression.right),
    ];
  }

  // supports checking for template literal strings but only if there are no
  // expressions in that template literal string. note that the rule
  // `no-attribute-template-literals` handles reporting template literals with
  // expressions
  if (expression.type === 'TemplateLiteral') {
    const templateLiteral = expression;
    if (templateLiteral.expressions.length) return [];
    if (templateLiteral.quasis.length !== 1) return [];
    return [templateLiteral];
  }

  if (expression.type !== 'Literal') return [];
  if (typeof expression.value !== 'string') return [];
  return [expression];
}

function getAttributeStringLiterals(n: TSESTree.JSXAttribute['value']) {
  if (!n) return [];
  if (n.type === 'Literal' && typeof n.value === 'string') return [n];
  if (n.type !== 'JSXExpressionContainer') return [];
  if (n.expression.type === 'JSXEmptyExpression') return [];

  return getStringLiteralsFromExpression(n.expression);
}

export const noAttributeStringLiterals: ESLint.Rule.RuleModule = {
  meta: { schema },
  create(context) {
    const options = (context.options[0] ||
      defaultNoAttributeStringLiteralsOptions) as RuleOptions;

    const only: InputOption =
      options.mode === 'override'
        ? options.only
        : {
            and: [options.only, defaultNoAttributeStringLiteralsOptions.only],
          };

    const ignores: InputOption =
      options.mode === 'override'
        ? options.ignores
        : {
            or: [
              options.ignores,
              defaultNoAttributeStringLiteralsOptions.ignores,
            ],
          };

    return {
      JSXOpeningElement(node) {
        const attributes = node.attributes
          .filter(
            (n): n is Extract<typeof n, { type: 'JSXAttribute' }> =>
              n.type === 'JSXAttribute',
          )
          .flatMap((attribute) =>
            getAttributeStringLiterals(attribute.value).map((n) => ({
              component: getComponentName(node.name),
              name: getAttributeName(attribute),
              value:
                n.type === 'TemplateLiteral'
                  ? n.quasis[0].value.cooked
                  : n.value,
              node: n,
            })),
          )
          .filter((i) => typeof i.value === 'string')
          .filter((i) => (expressionIsEmpty(only) ? true : evaluate(only, i)))
          .filter((i) => !evaluate(ignores, i));

        for (const attribute of attributes) {
          context.report({
            // @ts-expect-error
            node: attribute.node,
            message: `Attribute \`${attribute.name}\` on component \`${attribute.component}\` has invalid string literal \`${attribute.value}\`.`,
          });
        }
      },
    };
  },
};
