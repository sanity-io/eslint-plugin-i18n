import type { TSESTree } from '@typescript-eslint/typescript-estree';
import type ESLint from 'eslint';
import { defaultNoAttributeTemplateLiteralsOptions } from './defaults';
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
 * Pulls literal values from certain expressions recursively
 */
function getTemplateLiteralsFromExpression(
  expression: TSESTree.Expression,
): TSESTree.TemplateLiteral[] {
  // supports reaching into conditional expressions (i.e. ternary ? : expressions)
  if (expression.type === 'ConditionalExpression') {
    return [
      ...getTemplateLiteralsFromExpression(expression.consequent),
      ...getTemplateLiteralsFromExpression(expression.alternate),
    ];
  }

  // supports reaching into logical expressions (e.g. value ?? 'fallback')
  if (expression.type === 'LogicalExpression') {
    return [
      ...getTemplateLiteralsFromExpression(expression.left),
      ...getTemplateLiteralsFromExpression(expression.right),
    ];
  }

  if (expression.type !== 'TemplateLiteral') return [];

  const templateLiteral = expression;

  // note: unlike `no-attribute-string-literals`, this rule does not report
  // template literals without expressions because that is better caught by the
  // `no-attribute-string-literals` rule
  if (!templateLiteral.expressions.length) return [];
  return [templateLiteral];
}

function getAttributeTemplateLiterals(n: TSESTree.JSXAttribute['value']) {
  if (!n) return [];
  if (n.type === 'Literal') return [];
  if (n.type !== 'JSXExpressionContainer') return [];
  if (n.expression.type === 'JSXEmptyExpression') return [];

  return getTemplateLiteralsFromExpression(n.expression);
}

export const noAttributeTemplateLiterals: ESLint.Rule.RuleModule = {
  meta: { schema },
  create(context) {
    const options = (context.options[0] ||
      defaultNoAttributeTemplateLiteralsOptions) as RuleOptions;

    const only: InputOption =
      options.mode === 'override'
        ? options.only
        : {
            and: [options.only, defaultNoAttributeTemplateLiteralsOptions.only],
          };

    const ignores: InputOption =
      options.mode === 'override'
        ? options.ignores
        : {
            or: [
              options.ignores,
              defaultNoAttributeTemplateLiteralsOptions.ignores,
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
            getAttributeTemplateLiterals(attribute.value).flatMap((n) =>
              n.quasis.map((quasi) => ({
                component: getComponentName(node.name),
                name: getAttributeName(attribute),
                value: quasi.value.cooked,
                node: quasi,
              })),
            ),
          )
          .filter(
            (i) =>
              typeof i.value === 'string' &&
              // note, we purposefully don't consider empty string here
              !!i.value.length,
          )
          .filter((i) => (expressionIsEmpty(only) ? true : evaluate(only, i)))
          .filter((i) => !evaluate(ignores, i));

        for (const attribute of attributes) {
          context.report({
            node: attribute.node,
            message: `Attribute \`${attribute.name}\` on component \`${attribute.component}\` has invalid template element \`${attribute.value}\`.`,
          });
        }
      },
    };
  },
};
