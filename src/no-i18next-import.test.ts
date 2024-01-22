import { RuleTester } from '@typescript-eslint/rule-tester';
import { noI18NextImport } from './no-i18next-import';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
});

ruleTester.run(
  'no-i18next-import',
  // @ts-expect-error
  noI18NextImport,
  {
    valid: [
      {
        code: 'import {useTranslation} from "sanity"',
      },
      {
        code: 'import {Translate} from "sanity"',
      },
      {
        code: 'const {useTranslation} = require("sanity")',
      },
      {
        code: 'const {Translate} = require("sanity")',
      },
    ],
    invalid: [
      // Straight imports
      {
        code: 'import i18next from "i18next"',
        errors: [
          `Importing from 'i18next' is not allowed. Import from 'sanity' instead.`,
        ],
        output: 'import i18next from "i18next"',
      },
      {
        code: 'import reactI18next from "react-i18next"',
        errors: [
          `Importing from 'react-i18next' is not allowed. Import from 'sanity' instead.`,
        ],
        output: 'import reactI18next from "react-i18next"',
      },

      // Straight requires
      {
        code: 'const i18next = require("i18next")',
        errors: [
          `Importing from 'i18next' is not allowed. Import from 'sanity' instead.`,
        ],
        output: 'const i18next = require("i18next")',
      },
      {
        code: 'const reactI18next = require("react-i18next")',
        errors: [
          `Importing from 'react-i18next' is not allowed. Import from 'sanity' instead.`,
        ],
        output: 'const reactI18next = require("react-i18next")',
      },

      // useTranslation imports
      {
        code: 'import {useTranslation} from "react-i18next"',
        errors: [
          `Importing from 'react-i18next' is not allowed. Import from 'sanity' instead.`,
        ],
        output: 'import {useTranslation} from "sanity"',
      },
      {
        code: `import {useTranslation} from 'react-i18next'`,
        errors: [
          `Importing from 'react-i18next' is not allowed. Import from 'sanity' instead.`,
        ],
        output: `import {useTranslation} from 'sanity'`,
      },

      // useTranslation requires
      {
        code: `const {useTranslation} = require("react-i18next")`,
        errors: [
          `Importing from 'react-i18next' is not allowed. Import from 'sanity' instead.`,
        ],
        output: `const {useTranslation} = require("sanity")`,
      },
      {
        code: `const {useTranslation} = require('react-i18next')`,
        errors: [
          `Importing from 'react-i18next' is not allowed. Import from 'sanity' instead.`,
        ],
        output: `const {useTranslation} = require('sanity')`,
      },
    ],
  },
);
