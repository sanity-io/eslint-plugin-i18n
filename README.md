# @sanity/eslint-plugin-i18n

This ESLint plugin provides rules to enforce specific code standards in internationalization practices, particularly focusing on attribute strings and template literals in JSX. It aims to improve code quality and maintainability in projects with internationalization concerns.

## Installation

> **👋 Note:** We **highly** recommend installing [`@sanity/eslint-config-i18n`](https://github.com/sanity-io/eslint-config-i18n) instead which comes bundled with other plugins that are useful for localizing your Studio.

Ensure [ESLint](https://eslint.org/) is installed and initialized then install the following package:

```
npm install @sanity/eslint-plugin-i18n --save-dev
```

Then update your eslint configuration:

```js
// .eslintrc.cjs
module.exports = {
  plugins: ['@sanity/i18n'],
  rules: {
    '@sanity/i18n/no-attribute-string-literals': 'error',
    '@sanity/i18n/no-attribute-template-literals': 'error',
    '@sanity/i18n/no-i18next-import': 'error',
  },
};
```

## Rules

### `no-attribute-string-literals`

This rule finds string literals within JSX attributes. These attribute can be nested within ternary expression and logical expressions.

**Note:** This rule does not report if there is an expression within template literals as this is what `no-attribute-template-literals` is for.

Examples of **incorrect** code for this rule:

```jsx
// 🛑 JSX literal
<MyComponent prop="some string literal">
```

```jsx
// 🛑 string literal inside of a JSX expression container
<MyComponent prop={'some string literal'}>
```

```jsx
// 🛑 template literal with no expressions in a JSX expression container
<MyComponent prop={`some string literal`}>
```

```jsx
// 🛑 string literals nested within a ternary
<MyComponent prop={conditional ? 'nested literal' : 'another literal'}>
```

```jsx
// 🛑 string literals nested within a logical expression
<MyComponent prop={nullishValue ?? 'fallback literal'}>
```

Examples of **correct** code for this rule:

```jsx
// ✅ function call
<MyComponent text={t('some.localized.text')}>
```

```jsx
// ✅ not string literals
<MyComponent booleanAttr numberAttr={5}>
```

### `no-attribute-template-literals`

This rule finds template literals _with expressions_ within JSX attributes. These attribute can be nested within ternary expression and logical expressions.

**Note:** With the default configuration, this rule will only report if there is whitespace within a template element. See [usage](#usage) below to change this behavior.

Examples of **incorrect** code for this rule:

```jsx
// 🛑 template literal with an expression and whitespace
<MyComponent prop={`Hello ${name}!`}>
```

```jsx
// 🛑 template literals with expressions nested within a ternary
<MyComponent prop={conditional ? `Hello ${name}` : `Goodbye ${name}`}>
```

```jsx
// 🛑 template literals with expression nested within a logical expression
<MyComponent prop={nullishValue ?? `Hello ${name}`}>
```

Examples of **correct** code for this rule:

```jsx
// ✅ does not contain an expression (this will break the other rule)
<MyComponent text={`no expression`}>
```

```jsx
// ✅ no whitespace in the template element (with the default config)
<MyComponent id={`prefix-${id}`}>
```

```jsx
// ✅ not string literals
<MyComponent booleanAttr numberAttr={5}>
```

### `no-i18next-import`

This rule finds imports of the `i18next` and `react-i18next` package. While these packages are (currently) used as dependencies of `sanity`, this is considered an implementation detail and should not be relied upon. Instead, you should import any i18n utility/helper from the `sanity` module directly.

Examples of **incorrect** code for this rule:

```js
// 🛑 importing from `react-i18next``
import { useTranslation } from 'react-i18next';
```

```js
// 🛑 requiring from `react-i18next``
const { Trans } = require('react-i18next');
```

Examples of **correct** code for this rule:

```js
// ✅ requiring from `sanity`
const { Translate } = require('sanity');
```

## Usage

In your ESLint config, add `"@sanity/i18n"` to the list of plugins and enable the rules:

```js
// .eslintrc.cjs
module.exports = {
  plugins: ['@sanity/i18n'],
  rules: {
    '@sanity/i18n/no-attribute-string-literals': [
      'error',
      // these take in the same options.
      // you may omit this if you don't want to configure any more options.
      {
        ignores: {
          // ...
        },
        only: {
          // ...
        },
        mode: 'extend',
      },
    ],
    '@sanity/i18n/no-attribute-template-literals': [
      'error',
      // these take in the same options.
      // you may omit this if you don't want to configure any more options.
      {
        ignores: {
          // ...
        },
        only: {
          // ...
        },
        mode: 'extend',
      },
    ],
    '@sanity/i18n/no-i18next-import': 'error',
  },
};
```

### Rule options

| Option    | Description                                                                                                                                                                           | Type                          | Default value                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------- |
| `mode`    | If the mode is specified as `override` the default configuration for `ignores` and `only` will be overridden by the user configuration. The default behavior is to `extend`.          | `'extend' \| 'override'`      | `'extend'`                   |
| `only`    | If specified, only attributes matching its conditions will be considered. If omitted, all attributes are initially selected.                                                          | [`InputOption`](#inputoption) | [See here](/src/defaults.ts) |
| `ignores` | This is the primary filter used to specify exceptions or conditions for which attributes should not be reported. Attributes matching its conditions are excluded from being reported. | [`InputOption`](#inputoption) | [See here](/src/defaults.ts) |

**Note:** If the `only` option is present with `ignores`, the `only` option will determine which attributes to consider and then the `ignores` option is used to ignore any attributes that match.

#### `InputOption`

The `only` and `ignores` options take in this `InputOption` type shown below. Note how you can combine logic expressions to consider and ignore different attributes.

```ts
type InputOption =
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
```

There are three logical operators to aid in crafting your criteria:

- **OR (`or`)**: Any condition within the `or` block being true makes the entire block true.
- **AND (`and`)**: All conditions within the `and` block must be true for the entire block to be true.
- **NOT (`not`)**: Inverts the result of its condition.

When multiple keys are present in the input object, they follow the "OR" logic. If you desire an "AND" relationship, use the `and` condition explicitly. For example, to enforce that an attribute must be from the `Button` component AND named 'as', you'd use:

```json
{
  "and": [{ "components": ["Button"] }, { "attributes": ["as"] }]
}
```

See the [defaults](./src/defaults.ts) for more examples.

Additionally the default options can be imported via `@sanity/eslint-plugin-i18n/defaults`

```js
const {
  defaultNoAttributeTemplateLiteralsOptions,
  defaultNoAttributeStringLiteralsOptions,
} = require('@sanity/eslint-plugin-i18n/defaults');
```
