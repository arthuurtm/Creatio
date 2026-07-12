import type { SDKNode } from "@projeto/types";

export class FunctionsTranspiler {
  /**
   * Encontra nós de declaração de funções e registra seus IDs na tabela de símbolos
   */
  public static collect(nodes: SDKNode[]): SDKNode[] {
    return nodes.filter(
      (node) => node.type === "functions" && node.data?.ast?.category === "FUNCTION_DEFINITION"
    );
  }
}
