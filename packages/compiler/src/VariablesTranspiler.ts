import type { SDKNode, NodeConnection } from "@projeto/types";
import { generate } from "astring";

interface ESTreeNode {
  type: string;
  [key: string]: any;
}

type LiteralValue = number | boolean | string;

export class VariablesTranspiler {
  private symbolTable = new Map<string, string>();
  private nodes: SDKNode[] = [];
  private edges: NodeConnection[] = [];

  constructor(nodes: SDKNode[], edges: NodeConnection[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  /**
   * Transpila qualquer conjunto de nós que possua uma AST ESTree associada em node.data.ast.estree
   */
  public transpile(): string {
    this.symbolTable.clear();

    // 1. Encontra as declarações (Variáveis e Funções) e registra seus IDs na Tabela de Símbolos
    const variableDeclarations = this.collectDeclarationNodes("variables", "VARIABLE_DECLARATION");
    const functionDeclarations = this.collectDeclarationNodes("functions", "FUNCTION_DEFINITION");

    for (const decNode of [...variableDeclarations, ...functionDeclarations]) {
      const { name } = decNode.data.ast.params;
      this.symbolTable.set(decNode.id, this.sanitizeVariableName(name));
    }

    // 2. Processa as declarações de variáveis primeiro (estáticas no topo do código)
    const declarationNodes = variableDeclarations
      .map((decNode) => decNode.data?.ast?.estree)
      .filter((rawESTree): rawESTree is ESTreeNode => Boolean(rawESTree))
      .map((rawESTree) => {
        const estreeClone = this.cloneESTree(rawESTree);
        this.resolveIdentifiers(estreeClone);
        return estreeClone;
      });

    // 3. Processa recursivamente o fluxo sequencial principal (parentId = null)
    const bodyNodes = this.compileStatements(null);

    // 4. Monta o nó raiz do Programa
    const programAST: ESTreeNode = {
      type: "Program",
      body: [...declarationNodes, ...bodyNodes],
      sourceType: "module",
    };

    // 5. Gera o código JavaScript formatado
    return generate(programAST);
  }

  /**
   * Encontra nós de declaração (variáveis ou funções) de um tipo/categoria específicos
   */
  private collectDeclarationNodes(nodeType: string, category: string): SDKNode[] {
    return this.nodes.filter(
      (node) => node.type === nodeType && node.data?.ast?.category === category
    );
  }

  /**
   * Compila recursivamente os statements de um nível de escopo específico
   */
  private compileStatements(parentId: string | null): ESTreeNode[] {
    const levelStatements = this.getOrderedExecutionStatements(parentId);
    const compiled: ESTreeNode[] = [];

    for (const stmtNode of levelStatements) {
      const rawESTree = stmtNode.data?.ast?.estree;
      if (!rawESTree) continue;

      const estreeClone = this.cloneESTree(rawESTree);

      // Se o nó visual abrir um escopo, compila seus nós filhos recursivamente
      if (stmtNode.data.ast.hasScope) {
        const children = this.compileStatements(stmtNode.id);
        this.injectScopeChildren(estreeClone, children);
      }

      this.resolveIdentifiers(estreeClone);
      compiled.push(estreeClone);
    }

    return this.mergeConditionalStatements(compiled);
  }

  /**
   * Mescla nós de ElseIf e Else sequenciais no IfStatement anterior
   */
  private mergeConditionalStatements(nodes: ESTreeNode[]): ESTreeNode[] {
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
  private injectScopeChildren(parentESTree: ESTreeNode, children: ESTreeNode[]): void {
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
   * Resolve identificadores e converte literais de forma recursiva
   */
  private resolveIdentifiers(node: any): void {
    if (!node || typeof node !== "object") return;

    if (node.type === "Identifier" && typeof node.name === "string") {
      const resolvedName = this.symbolTable.has(node.name)
        ? this.symbolTable.get(node.name)!
        : this.substituteEmbeddedIds(node.name);

      const literal = this.tryParseLiteral(resolvedName);
      if (literal) {
        node.type = "Literal";
        node.value = literal.value;
        delete node.name;
      } else {
        node.name = resolvedName;
      }
    }

    // Recursão para propriedades filhas
    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          this.resolveIdentifiers(item);
        }
      } else if (child && typeof child === "object") {
        this.resolveIdentifiers(child);
      }
    }
  }

  /**
   * Substitui IDs de variáveis/funções que aparecem embutidos dentro de um nome/expressão
   */
  private substituteEmbeddedIds(name: string): string {
    let result = name;
    for (const [id, realName] of this.symbolTable.entries()) {
      result = result.split(id).join(realName);
    }
    return result;
  }

  /**
   * Tenta interpretar uma string como número, booleano ou string entre aspas
   */
  private tryParseLiteral(value: string): { value: LiteralValue } | null {
    if (!isNaN(Number(value))) {
      return { value: Number(value) };
    }

    if (value === "true" || value === "false") {
      return { value: value === "true" };
    }

    const isQuoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));

    if (isQuoted) {
      return { value: value.slice(1, -1) };
    }

    return null;
  }

  private sanitizeVariableName(name: string): string {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .replace(/^[0-9]/, "_$&");
  }

  private cloneESTree(estree: ESTreeNode): ESTreeNode {
    return JSON.parse(JSON.stringify(estree));
  }

  private getOrderedExecutionStatements(parentId: string | null): SDKNode[] {
    // Filtra apenas nós que pertencem a este nível de escopo (parentId)
    const levelNodes = this.nodes.filter((n) => (n.parentNode || null) === parentId);

    // Não inclui declarações de variáveis no fluxo (elas vão no topo global do código)
    const statements = levelNodes.filter(
      (n) => n.data?.ast?.category !== "VARIABLE_DECLARATION"
    );

    const hasIncomingExecution = (nodeId: string) =>
      this.edges.some((e) => e.target === nodeId && e.data?.type === "execution");

    // Encontra os nós iniciais deste nível (não têm entrada de execução vinda de outro nó do mesmo nível)
    const entryPoints = statements.filter((node) => !hasIncomingExecution(node.id));

    const ordered: SDKNode[] = [];
    const visited = new Set<string>();

    for (const root of entryPoints) {
      let current: SDKNode | undefined = root;
      while (current && !visited.has(current.id) && (current.parentNode || null) === parentId) {
        visited.add(current.id);
        ordered.push(current);

        const nextEdge = this.edges.find(
          (e) => e.source === current!.id && e.data?.type === "execution"
        );

        current = nextEdge ? this.nodes.find((n) => n.id === nextEdge.target) : undefined;
      }
    }

    return ordered;
  }
}
