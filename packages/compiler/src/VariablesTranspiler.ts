import type { SDKNode, NodeConnection } from "@projeto/types";
import { generate } from "astring";

interface ESTreeNode {
  type: string;
  [key: string]: any;
}

export class VariablesTranspiler {
  private symbolTable = new Map<string, string>(); // ID do node -> Nome Real
  private nodes: SDKNode[] = [];
  private edges: NodeConnection[] = [];

  constructor(nodes: SDKNode[], edges: NodeConnection[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  /**
   * Transpila qualquer conjunto de nós que possua uma AST ESTree associada em node.data.estree
   */
  public transpile(): string {
    this.symbolTable.clear();

    const declarationNodes: ESTreeNode[] = [];

    // 1. Fase de Registro: Encontra as declarações de variáveis e registra seus IDs na Tabela de Símbolos
    const variableDeclarations = this.nodes.filter(
      (node) => node.type === "variables" && node.data?.category === "VARIABLE_DECLARATION"
    );
    for (const decNode of variableDeclarations) {
      const { name } = decNode.data.params!;
      const safeName = this.sanitizeVariableName(name);
      this.symbolTable.set(decNode.id, safeName);
    }

    // Registra também as atribuições na Tabela de Símbolos para que referências a blocos de atribuição apontem para o nome real
    const variableAssignments = this.nodes.filter(
      (node) => node.type === "variables" && node.data?.category === "VARIABLE_ASSIGNMENT"
    );
    for (const assignNode of variableAssignments) {
      const { varId } = assignNode.data.params!;
      const targetName = this.symbolTable.get(varId);
      if (targetName) {
        this.symbolTable.set(assignNode.id, targetName);
      }
    }

    // Registra as funções na Tabela de Símbolos
    const functionDeclarations = this.nodes.filter(
      (node) => node.type === "functions" && node.data?.category === "FUNCTION_DEFINITION"
    );
    for (const funcNode of functionDeclarations) {
      const { name } = funcNode.data.params!;
      const safeName = this.sanitizeVariableName(name);
      this.symbolTable.set(funcNode.id, safeName);
    }

    // 2. Processa as declarações de variáveis primeiro (estáticas no topo do código)
    for (const decNode of variableDeclarations) {
      const rawESTree = decNode.data?.estree;
      if (rawESTree) {
        const estreeClone = JSON.parse(JSON.stringify(rawESTree));
        this.resolveIdentifiers(estreeClone);
        declarationNodes.push(estreeClone);
      }
    }

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
   * Compila recursivamente os statements de um nível de escopo específico
   */
  private compileStatements(parentId: string | null): ESTreeNode[] {
    const levelStatements = this.getOrderedExecutionStatements(parentId);
    const compiled: ESTreeNode[] = [];

    for (const stmtNode of levelStatements) {
      const rawESTree = stmtNode.data?.estree;
      if (rawESTree) {
        const estreeClone = JSON.parse(JSON.stringify(rawESTree));
        
        // Se o nó visual abrir um escopo, compila seus nós filhos recursivamente
        if (stmtNode.data.hasScope) {
          const children = this.compileStatements(stmtNode.id);
          this.injectScopeChildren(estreeClone, children);
        }

        this.resolveIdentifiers(estreeClone);
        compiled.push(estreeClone);
      }
    }

    return this.mergeConditionalStatements(compiled);
  }

  /**
   * Mescla nós de ElseIf e Else sequenciais no IfStatement anterior
   */
  private mergeConditionalStatements(nodes: ESTreeNode[]): ESTreeNode[] {
    const result: ESTreeNode[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const current = nodes[i];

      if (current.type === "ElseIfStatement" || current.type === "ElseStatement") {
        // Encontra o último IfStatement adicionado para acoplar como "alternate"
        const last = result[result.length - 1];
        if (last && (last.type === "IfStatement" || last.type === "ElseIfStatement")) {
          // Converte para tipo padrão que o Astring entende
          if (current.type === "ElseIfStatement") {
            current.type = "IfStatement";
          } else {
            result[result.length - 1].alternate = current.consequent;
            continue;
          }
          
          // Encontra a folha (último alternate nulo) na cadeia de If/ElseIf
          let leaf = last;
          while (leaf.alternate && leaf.alternate.type === "IfStatement") {
            leaf = leaf.alternate;
          }
          leaf.alternate = current;
        } else {
          // Fallback: se estiver órfão, gera como um If normal para não quebrar a sintaxe
          if (current.type === "ElseIfStatement") {
            current.type = "IfStatement";
            result.push(current);
          } else {
            result.push(current.consequent);
          }
        }
      } else {
        result.push(current);
      }
    }

    return result;
  }

  /**
   * Injeta os filhos compilados no local correto da AST do nó pai
   */
  private injectScopeChildren(parentESTree: ESTreeNode, children: ESTreeNode[]): void {
    const type = parentESTree.type;

    if (type === "FunctionDeclaration") {
      parentESTree.body = parentESTree.body || { type: "BlockStatement", body: [] };
      parentESTree.body.body = children;
    } else if (type === "IfStatement") {
      parentESTree.consequent = parentESTree.consequent || { type: "BlockStatement", body: [] };
      parentESTree.consequent.body = children;
    } else if (type === "ForStatement" || type === "WhileStatement" || type === "DoWhileStatement") {
      parentESTree.body = parentESTree.body || { type: "BlockStatement", body: [] };
      parentESTree.body.body = children;
    } else if (type === "SwitchStatement") {
      parentESTree.cases = children; // Nós do tipo SwitchCase
    } else if (type === "SwitchCase") {
      parentESTree.consequent = children;
    }
  }

  /**
   * Resolve identificadores e converte literais de forma recursiva
   */
  private resolveIdentifiers(node: any): void {
    if (!node || typeof node !== "object") return;

    if (node.type === "Identifier") {
      // 1. Se o nome for um array de tokens (gerados pelo construtor de expressões)
      if (Array.isArray(node.name)) {
        const resolvedTokens = node.name.map((token: any) => {
          const val = token.value;
          if (this.symbolTable.has(val)) {
            return this.symbolTable.get(val)!;
          }
          let resolved = val;
          for (const [id, realName] of this.symbolTable.entries()) {
            resolved = resolved.replace(new RegExp(id, "g"), realName);
          }
          return resolved;
        });
        node.name = resolvedTokens.join(" ");
      }

      if (typeof node.name === "string") {
        const name = node.name;

        // 2. Se for ID de uma variável declarada, substitui pelo nome real
        if (this.symbolTable.has(name)) {
          node.name = this.symbolTable.get(name)!;
        } 
        // 3. Se for uma expressão que contém IDs de variáveis, substitui cada ID ocorrido
        else {
          let resolvedName = name;
          for (const [id, realName] of this.symbolTable.entries()) {
            resolvedName = resolvedName.replace(new RegExp(id, "g"), realName);
          }
          node.name = resolvedName;
        }

        // 4. Se o nome resolvido for número literal disfarçado de Identifier, converte para Literal
        if (node.type === "Identifier" && !isNaN(Number(node.name))) {
          const val = Number(node.name);
          node.type = "Literal";
          node.value = val;
          delete node.name;
        } 
        // 5. Se for booleano
        else if (node.type === "Identifier" && (node.name === "true" || node.name === "false")) {
          const val = node.name === "true";
          node.type = "Literal";
          node.value = val;
          delete node.name;
        } 
        // 6. Se for string com aspas
        else if (
          node.type === "Identifier" &&
          ((node.name.startsWith('"') && node.name.endsWith('"')) ||
            (node.name.startsWith("'") && node.name.endsWith("'")))
        ) {
          const val = node.name.slice(1, -1);
          node.type = "Literal";
          node.value = val;
          delete node.name;
        }
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

  private sanitizeVariableName(name: string): string {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .replace(/^[0-9]/, "_$&");
  }

  private getOrderedExecutionStatements(parentId: string | null): SDKNode[] {
    // Filtra apenas nós que pertencem a este nível de escopo (parentId)
    const levelNodes = this.nodes.filter((n) => {
      const nodeParent = n.parentNode || null;
      return nodeParent === parentId;
    });

    const ordered: SDKNode[] = [];
    const visited = new Set<string>();

    // Não inclui declarações de variáveis no fluxo (elas vão no topo global do código)
    const statements = levelNodes.filter(
      (n) => n.data?.category !== "VARIABLE_DECLARATION"
    );

    // Encontra os nós iniciais deste nível (não têm entrada de execução vinda de outro nó do mesmo nível)
    const entryPoints = statements.filter((node) => {
      const hasInputExecution = this.edges.some(
        (e) => e.target === node.id && e.data?.type === "execution"
      );
      return !hasInputExecution;
    });

    for (const root of entryPoints) {
      let current: SDKNode | undefined = root;
      while (current && !visited.has(current.id) && (current.parentNode || null) === parentId) {
        visited.add(current.id);
        ordered.push(current);

        const nextEdge = this.edges.find(
          (e) => e.source === current!.id && e.data?.type === "execution"
        );

        current = nextEdge
          ? this.nodes.find((n) => n.id === nextEdge.target)
          : undefined;
      }
    }

    return ordered;
  }
}
