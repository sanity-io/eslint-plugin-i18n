import type { TSESTree } from '@typescript-eslint/typescript-estree';

declare module 'eslint' {
  namespace Rule {
    type TSNodeListener = {
      [TType in TSESTree.AST_NODE_TYPES]?: (
        node: Extract<TSESTree.Node, { type: TType }>,
      ) => void;
    };

    interface NodeListener extends TSNodeListener {}
  }
}
