import type { ESLint } from 'eslint';

import { noAttributeStringLiterals } from './no-attribute-string-literals';
import { noAttributeTemplateLiterals } from './no-attribute-template-literals';

const plugin: ESLint.Plugin = {
  meta: {
    name: process.env.PACKAGE_NAME,
    version: process.env.PACKAGE_VERSION,
  },
  rules: {
    'no-attribute-string-literals': noAttributeStringLiterals,
    'no-attribute-template-literals': noAttributeTemplateLiterals,
  },
};

export default plugin;
