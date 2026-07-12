import type { SDKNode } from "@projeto/types";
import type { ESTreeNode, TranspilationContext } from "./ASTTranspiler";

export class VariablesTranspiler {
  /**
   * Encontra nós de declaração de variáveis e registra seus IDs na tabela de símbolos
   */
  public static collect(nodes: SDKNode[]): SDKNode[] {
    return nodes.filter(
      (node) => node.type === "variables" && node.data?.ast?.category === "VARIABLE_DECLARATION"
    );
  }

  /**
   * Transpila os nós de declaração de variáveis resolvendo identificadores
   */
  public static transpile(nodes: SDKNode[], ctx: TranspilationContext): ESTreeNode[] {
    return nodes
      .map((decNode) => decNode.data?.ast?.estree)
      .filter((rawESTree): rawESTree is ESTreeNode => Boolean(rawESTree))
      .map((rawESTree) => {
        const estreeClone = ctx.cloneESTree(rawESTree);
        ctx.resolveIdentifiers(estreeClone);
        return estreeClone;
      });
  }
}
