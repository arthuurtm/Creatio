import type { SDKNode } from "@projeto/types";
import { getASTData, type ESTreeNode, type TranspilationContext } from "./ASTTranspiler.ts";

export class VariablesTranspiler {
  /**
   * Encontra nós de declaração de variáveis e registra seus IDs na tabela de símbolos
   */
  public static collect(nodes: SDKNode[]): SDKNode[] {
    return (nodes || []).filter((node) => {
      const ast = getASTData(node);
      return node.type === "variables" && ast?.category === "VARIABLE_DECLARATION";
    });
  }

  /**
   * Transpila os nós de declaração de variáveis resolvendo identificadores
   */
  public static transpile(nodes: SDKNode[], ctx: TranspilationContext): ESTreeNode[] {
    return (nodes || [])
      .map((decNode) => getASTData(decNode)?.estree)
      .filter((rawESTree): rawESTree is ESTreeNode => Boolean(rawESTree))
      .map((rawESTree) => {
        const estreeClone = ctx.cloneESTree(rawESTree);
        ctx.resolveIdentifiers(estreeClone);
        return estreeClone;
      });
  }
}
