import type { SDKNode } from "@projeto/types";
import { getASTData, type ESTreeNode, type TranspilationContext } from "./ASTTranspiler.ts";

export class LogicsTranspiler {
  /**
   * Transpila recursivamente o nível de escopo principal ou internos dos blocos de lógica
   */
  public static transpile(parentId: string | null, ctx: TranspilationContext): ESTreeNode[] {
    const levelStatements = this.getOrderedExecutionStatements(parentId, ctx);
    const compiled: ESTreeNode[] = [];

    for (const stmtNode of levelStatements) {
      const ast = getASTData(stmtNode);
      const rawESTree = ast?.estree;
      if (!rawESTree) continue;

      const estreeClone = ctx.cloneESTree(rawESTree);

      // Se o nó visual abrir um escopo, compila seus nós filhos recursivamente
      if (ast?.hasScope) {
        const children = ctx.compileStatements(stmtNode.id);
        this.injectScopeChildren(estreeClone, children);
      }

      ctx.resolveIdentifiers(estreeClone);
      compiled.push(estreeClone);
    }

    return this.mergeConditionalStatements(compiled);
  }

  /**
   * Mescla nós de ElseIf e Else sequenciais no IfStatement anterior
   */
  private static mergeConditionalStatements(nodes: ESTreeNode[]): ESTreeNode[] {
    const isIfLike = (node?: ESTreeNode) =>
      node?.type === "IfStatement" || node?.type === "ElseIfStatement";

    const result: ESTreeNode[] = [];

    for (const current of nodes) {
      if (current.type !== "ElseIfStatement" && current.type !== "ElseStatement") {
        result.push(current);
        continue;
      }

      const last = result[result.length - 1];

      if (!isIfLike(last)) {
        // Fallback: se estiver órfão, gera como um If normal para não quebrar a sintaxe
        if (current.type === "ElseIfStatement") {
          current.type = "IfStatement";
          result.push(current);
        } else {
          result.push(current.consequent);
        }
        continue;
      }

      if (current.type === "ElseStatement") {
        last.alternate = current.consequent;
        continue;
      }

      // Converte ElseIf para o tipo padrão que o Astring entende
      current.type = "IfStatement";

      // Encontra a folha (último alternate nulo) na cadeia de If/ElseIf
      let leaf = last;
      while (leaf.alternate && leaf.alternate.type === "IfStatement") {
        leaf = leaf.alternate;
      }
      leaf.alternate = current;
    }

    return result;
  }

  /**
   * Injeta os filhos compilados no local correto da AST do nó pai
   */
  private static injectScopeChildren(parentESTree: ESTreeNode, children: ESTreeNode[]): void {
    const emptyBlock = (): ESTreeNode => ({ type: "BlockStatement", body: [] });

    switch (parentESTree.type) {
      case "FunctionDeclaration":
      case "ForStatement":
      case "WhileStatement":
      case "DoWhileStatement":
        parentESTree.body = parentESTree.body || emptyBlock();
        parentESTree.body.body = children;
        break;
      case "IfStatement":
        parentESTree.consequent = parentESTree.consequent || emptyBlock();
        parentESTree.consequent.body = children;
        break;
      case "SwitchStatement":
        parentESTree.cases = children; // Nós do tipo SwitchCase
        break;
      case "SwitchCase":
        parentESTree.consequent = children;
        break;
    }
  }

  /**
   * Ordena e filtra os nós de execução do nível de escopo atual, excluindo declarações
   */
  private static getOrderedExecutionStatements(parentId: string | null, ctx: TranspilationContext): SDKNode[] {
    const getParent = (n: SDKNode) => n.parentNode || n.data?.parentId || null;

    // Filtra apenas nós que pertencem a este nível de escopo (parentId)
    const levelNodes = (ctx.nodes || []).filter((n) => getParent(n) === parentId);

    // Não inclui declarações de variáveis no fluxo (elas vão no topo global do código)
    const statements = levelNodes.filter((n) => {
      const ast = getASTData(n);
      return ast?.category !== "VARIABLE_DECLARATION";
    });

    const hasIncomingExecution = (nodeId: string) =>
      (ctx.edges || []).some(
        (e) => e.target === nodeId && (e.data?.type === "execution" || !e.data?.type)
      );

    // Encontra os nós iniciais deste nível (não têm entrada de execução vinda de outro nó do mesmo nível)
    const entryPoints = statements.filter((node) => !hasIncomingExecution(node.id));

    const ordered: SDKNode[] = [];
    const visited = new Set<string>();

    for (const root of entryPoints) {
      let current: SDKNode | undefined = root;
      while (current && !visited.has(current.id) && getParent(current) === parentId) {
        visited.add(current.id);
        ordered.push(current);

        const nextEdge = (ctx.edges || []).find(
          (e) => e.source === current!.id && (e.data?.type === "execution" || !e.data?.type)
        );

        current = nextEdge ? ctx.nodes.find((n) => n.id === nextEdge.target) : undefined;
      }
    }

    // Se houver nós soltos (sem conexão), inclui todos eles na lista ordenada
    for (const stmt of statements) {
      if (!visited.has(stmt.id) && getParent(stmt) === parentId) {
        visited.add(stmt.id);
        ordered.push(stmt);
      }
    }

    return ordered;
  }
}
