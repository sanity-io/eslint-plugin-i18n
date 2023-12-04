import { RuleTester } from '@typescript-eslint/rule-tester';
import { noAttributeStringLiterals } from './no-attribute-string-literals';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
});

ruleTester.run(
  'no-attribute-string-literals',
  // @ts-expect-error
  noAttributeStringLiterals,
  {
    valid: [
      {
        // not a string literal
        code: '<Button someAttribute />',
      },
      {
        // via the default config, `id` attributes are allowed
        code: '<Button id="some-literal" />',
      },
      {
        // via the default config, `aria-hidden` attributes are allowed
        code: '<Button aria-hidden="true" />',
      },
      {
        code: '<> <Button tone="primary" /> <Checkbox tone="default" /> </>',
        options: [{ ignores: { values: ['primary', 'default'] } }],
      },
      {
        code: '<Box theme="dark-mode" />',
        options: [{ ignores: { valuePatterns: ['^dark-\\w+'] } }],
      },
      {
        code: '<Button as="a" href="https://example.com">click me</Button>',
        options: [{ ignores: { attributes: ['as', 'href'] } }],
      },
      {
        code: '<Button data-testid="button" />',
        options: [{ ignores: { attributePatterns: ['^data-\\w+'] } }],
      },
      {
        code: '<Button:namespace ignored="this comp is ignored now" />',
        options: [{ ignores: { components: ['Button:namespace'] } }],
      },
      {
        code: '<Some.Provider ignored="this comp is ignored now" />',
        options: [{ ignores: { componentPatterns: ['\\w+\\.Provider$'] } }],
      },
      {
        code: '<Button as="p" />',
        options: [
          {
            ignores: {
              and: [{ components: ['Button'] }, { attributes: ['as'] }],
            },
          },
        ],
      },
      {
        code: '<Ignored prop="this is ignored now" />',
        options: [{ only: { components: ['Button'] } }],
      },
    ],
    invalid: [
      {
        // not allowed by the default configuration
        code: '<Button aria-label="some aria-label" />',
        errors: [
          'Attribute `aria-label` on component `Button` has invalid string literal `some aria-label`.',
        ],
      },
      {
        code: '<Button someStringAttr="hello" />',
        errors: [
          'Attribute `someStringAttr` on component `Button` has invalid string literal `hello`.',
        ],
      },
      {
        code: '<Button someStringAttr={"hello"} />',
        errors: [
          'Attribute `someStringAttr` on component `Button` has invalid string literal `hello`.',
        ],
      },
      {
        code: '<Button someStringAttr={`hello`} />',
        errors: [
          'Attribute `someStringAttr` on component `Button` has invalid string literal `hello`.',
        ],
      },
      {
        code: '<Button someConditionalExpr={value ? "one" : "two"} />',
        errors: [
          'Attribute `someConditionalExpr` on component `Button` has invalid string literal `one`.',
          'Attribute `someConditionalExpr` on component `Button` has invalid string literal `two`.',
        ],
      },
      {
        code: '<Button someLogicalExpr={value ?? "fallback"} />',
        errors: [
          'Attribute `someLogicalExpr` on component `Button` has invalid string literal `fallback`.',
        ],
      },
      {
        code: '<> <Ignored prop="this is ignored now" /> <Button prop="wrong" /> </>',
        options: [{ mode: 'override', only: { components: ['Button'] } }],
        errors: [
          'Attribute `prop` on component `Button` has invalid string literal `wrong`.',
        ],
      },
      {
        code: '<> <NotButton as={"p"} /> <Button notAs="p" /> </>',
        options: [
          {
            mode: 'override',
            ignores: {
              and: [{ components: ['Button'] }, { attributes: ['as'] }],
            },
          },
        ],
        errors: [
          'Attribute `as` on component `NotButton` has invalid string literal `p`.',
          'Attribute `notAs` on component `Button` has invalid string literal `p`.',
        ],
      },
      {
        code: '<> <Button as="p" /> <Other prop="hey" /> </>',
        options: [
          {
            mode: 'override',
            only: {
              and: [{ components: ['Button'] }, { attributes: ['as'] }],
            },
          },
        ],
        errors: [
          'Attribute `as` on component `Button` has invalid string literal `p`.',
        ],
      },
    ],
  },
);
