import { RuleTester } from '@typescript-eslint/rule-tester';
import { noAttributeTemplateLiterals } from './no-attribute-template-literals';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
});

ruleTester.run(
  'no-attribute-template-literals',
  // @ts-expect-error
  noAttributeTemplateLiterals,
  {
    valid: [
      {
        code: '<Button someAttribute />',
      },
      {
        code: '<> <Button tone={`primary${foo}`} /> <Checkbox tone={`default${foo}`} /> </>',
        options: [{ ignores: { values: ['primary', 'default'] } }],
      },
      {
        code: '<Box theme={`dark\n${foo}`} />',
        options: [{ ignores: { valuePatterns: ['^dark'] } }],
      },
      {
        code: '<Button title={`Hello ${name}`}>click me</Button>',
        options: [{ ignores: { attributes: ['title'] } }],
      },
      {
        code: '<Button data-testid={`button ${foo}`} />',
        options: [{ ignores: { attributePatterns: ['^data-\\w+'] } }],
      },
      {
        code: '<Button:namespace ignored={`this comp is ignored now${foo}`} />',
        options: [{ ignores: { components: ['Button:namespace'] } }],
      },
      {
        code: '<Some.Provider ignored={`this comp is ignored now${foo}`} />',
        options: [{ ignores: { componentPatterns: ['\\w+\\.Provider$'] } }],
      },
      {
        code: '<Button as={`p ${foo}`} />',
        options: [
          {
            ignores: {
              and: [{ components: ['Button'] }, { attributes: ['as'] }],
            },
          },
        ],
      },
      {
        code: '<Ignored prop={`this is ignored now ${foo}`} />',
        options: [{ only: { components: ['Button'] } }],
      },
    ],
    invalid: [
      {
        code: '<Button someStringAttr={`hello ${foo}`} />',
        errors: [
          'Attribute `someStringAttr` on component `Button` has invalid template element `hello `.',
        ],
      },
      {
        code: '<Button someConditionalExpr={value ? `yes ${foo}` : `no ${foo}`} />',
        errors: [
          'Attribute `someConditionalExpr` on component `Button` has invalid template element `yes `.',
          'Attribute `someConditionalExpr` on component `Button` has invalid template element `no `.',
        ],
      },
      {
        code: '<Button someLogicalExpr={value ?? `fallback ${foo}`} />',
        errors: [
          'Attribute `someLogicalExpr` on component `Button` has invalid template element `fallback `.',
        ],
      },
      {
        code: '<> <Ignored prop="this is ignored now" /> <Button prop={`wrong${foo}`} /> </>',
        options: [{ mode: 'override', only: { components: ['Button'] } }],
        errors: [
          'Attribute `prop` on component `Button` has invalid template element `wrong`.',
        ],
      },
      {
        code: '<MyComponent title={`Hello ${name}!`} />',
        options: [
          {
            only: {
              valuePatterns: ['(\\s\\w+|\\w+\\s)'],
            },
          },
        ],
        errors: [
          'Attribute `title` on component `MyComponent` has invalid template element `Hello `.',
        ],
      },
    ],
  },
);
