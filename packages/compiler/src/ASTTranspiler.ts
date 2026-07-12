import type { SDKNode, NodeConnection } from "@projeto/types";
import { generate } from "astring";
import { VariablesTranspiler } from "./VariablesTranspiler.ts";
import { FunctionsTranspiler } from "./FunctionsTranspiler.ts";
import { LogicsTranspiler } from "./LogicsTranspiler.ts";

export interface ESTreeNode {
  type: string;
  [key: string]: any;
}

export type LiteralValue = number | boolean | string;

export interface TranspilationContext {
  symbolTable: Map<string, string>;
  nodes: SDKNode[];
  edges: NodeConnection[];
  resolveIdentifiers(node: any): void;
  cloneESTree(node: any): any;
  compileStatements(parentId: string | null): ESTreeNode[];
}

export class ASTTranspiler implements TranspilationContext {
  public symbolTable = new Map<string, string>();
  public nodes: SDKNode[] = [];
  public edges: NodeConnection[] = [];

  constructor(nodes: SDKNode[], edges: NodeConnection[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  /**
   * Transpila qualquer conjunto de nós visuais para código JavaScript formatado
   */
  public transpile(): string {
    this.symbolTable.clear();

    // 1. Encontra as declarações de variáveis e funções para a tabela de símbolos
    const variableDeclarations = VariablesTranspiler.collect(this.nodes);
    const functionDeclarations = FunctionsTranspiler.collect(this.nodes);

    for (const decNode of [...variableDeclarations, ...functionDeclarations]) {
      const { name } = decNode.data.ast.params;
      this.symbolTable.set(decNode.id, this.sanitizeVariableName(name));
    }

    // 2. Processa as declarações de variáveis (estáticas no topo do código)
    const declarationNodes = VariablesTranspiler.transpile(variableDeclarations, this);

    // 3. Processa o fluxo sequencial principal (parentId = null)
    const bodyNodes = this.compileStatements(null);

    // 4. Monta o nó raiz do Programa ESTree
    const programAST: ESTreeNode = {
      type: "Program",
      body: [...declarationNodes, ...bodyNodes],
      sourceType: "module",
    };

    // 5. Gera o código JavaScript formatado
    return generate(programAST);
  }

  /**
   * Ponto de entrada do contexto para compilar statements de um escopo específico
   */
  public compileStatements(parentId: string | null): ESTreeNode[] {
    return LogicsTranspiler.transpile(parentId, this);
  }

  /**
   * Resolve identificadores e converte literais de forma recursiva
   */
  public resolveIdentifiers(node: any): void {
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

  public cloneESTree(estree: ESTreeNode): ESTreeNode {
    return JSON.parse(JSON.stringify(estree));
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
}
