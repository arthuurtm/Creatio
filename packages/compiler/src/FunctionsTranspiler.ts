import type { SDKNode } from "@projeto/types";
import { getASTData } from "./ASTTranspiler.ts";

export class FunctionsTranspiler {
  /**
   * Encontra nós de declaração de funções e registra seus IDs na tabela de símbolos
   */
  public static collect(nodes: SDKNode[]): SDKNode[] {
    return (nodes || []).filter((node) => {
      const ast = getASTData(node);
      return node.type === "functions" && ast?.category === "FUNCTION_DEFINITION";
    });
  }
}
