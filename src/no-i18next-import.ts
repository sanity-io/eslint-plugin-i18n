import type ESLint from 'eslint';

const disallowedImports = ['i18next', 'react-i18next'];

export const noI18NextImport: ESLint.Rule.RuleModule = {
  meta: {
    type: 'problem',
    fixable: 'code',
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        // Is literal string import?
        if (typeof node.source.value !== 'string') {
          return;
        }

        // Is disallowed import?
        if (!disallowedImports.includes(node.source.value)) {
          return;
        }

        // Is this fixable? (only if importing useTranslation)
        let fix: ESLint.Rule.ReportFixer | undefined;
        if (
          node.specifiers.length === 1 &&
          node.specifiers.some(
            (specifier) =>
              specifier.type === 'ImportSpecifier' &&
              specifier.imported.name === 'useTranslation',
          )
        ) {
          // Are we importing with single or double quotes (try to maintain code style)
          const quote =
            node.source.raw && node.source.raw.trim()[0] === `'` ? `'` : `"`;
          fix = (fixer) =>
            node.source.range
              ? fixer.replaceTextRange(
                  node.source.range,
                  `${quote}sanity${quote}`,
                )
              : fixer.replaceText(
                  node,
                  `import {useTranslation} from ${quote}sanity${quote}`,
                );
        }

        context.report({
          node,
          message: `Importing from '${node.source.value}' is not allowed. Import from 'sanity' instead.`,
          fix,
        });
      },
      CallExpression(node) {
        node.parent.type;
        // Is require call?
        if (
          node.callee.type !== 'Identifier' ||
          node.callee.name !== 'require'
        ) {
          return;
        }

        // Require has single literal string argument?
        if (
          node.arguments.length !== 1 ||
          node.arguments[0].type !== 'Literal' ||
          typeof node.arguments[0].value !== 'string'
        ) {
          return;
        }

        // Is disallowed import?
        if (!disallowedImports.includes(node.arguments[0].value)) {
          return;
        }

        // Is this fixable? (only if importing useTranslation)
        let fix: ESLint.Rule.ReportFixer | undefined;
        if (isUseTranslationDecl(node)) {
          // Are we importing with single or double quotes (try to maintain code style)
          const raw = node.arguments[0].raw;
          const quote = raw && raw[0] === `'` ? `'` : `"`;
          fix = (fixer) =>
            node.arguments[0].range
              ? fixer.replaceTextRange(
                  node.arguments[0].range,
                  `${quote}sanity${quote}`,
                )
              : fixer.replaceText(
                  node,
                  `const {useTranslation} = require(${quote}sanity${quote})`,
                );
        }

        context.report({
          node,
          message: `Importing from '${node.arguments[0].value}' is not allowed. Import from 'sanity' instead.`,
          fix,
        });
      },
    };
  },
};

function isUseTranslationDecl(call: ESLint.Rule.NodeParentExtension) {
  const parent = call.parent;
  return (
    parent.type === 'VariableDeclarator' &&
    parent.id.type === 'ObjectPattern' &&
    parent.id.properties.length === 1 &&
    parent.id.properties.some(
      (prop) =>
        prop.type === 'Property' &&
        prop.key.type === 'Identifier' &&
        prop.key.name === 'useTranslation',
    )
  );
}
