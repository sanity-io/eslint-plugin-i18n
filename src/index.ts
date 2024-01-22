import type { ESLint } from 'eslint';

import { noAttributeStringLiterals } from './no-attribute-string-literals';
import { noAttributeTemplateLiterals } from './no-attribute-template-literals';
import { noI18NextImport } from './no-i18next-import';

const plugin: ESLint.Plugin = {
  meta: {
    name: process.env.PACKAGE_NAME,
    version: process.env.PACKAGE_VERSION,
  },
  rules: {
    'no-attribute-string-literals': noAttributeStringLiterals,
    'no-attribute-template-literals': noAttributeTemplateLiterals,
    'no-i18next-import': noI18NextImport,
  },
};

export default plugin;
