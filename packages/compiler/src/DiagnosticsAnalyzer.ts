import type { SDKNode, NodeConnection } from "@projeto/types";
import { getASTData } from "./ASTTranspiler.ts";

export type DiagnosticSeverity = "error" | "warning" | "info";

export interface Diagnostic {
  /** Unique rule identifier */
  rule: string;
  /** Severity level */
  severity: DiagnosticSeverity;
  /** Human-readable message in PT-BR */
  message: string;
  /** ID of the node that triggered this diagnostic */
  nodeId: string;
  /** Optional: readable name/label of the problematic node */
  nodeLabel?: string;
}

const JS_RESERVED_WORDS = new Set([
  "break", "case", "catch", "continue", "debugger", "default", "delete",
  "do", "else", "finally", "for", "function", "if", "in", "instanceof",
  "new", "return", "switch", "this", "throw", "try", "typeof", "var",
  "void", "while", "with", "class", "const", "enum", "export", "extends",
  "import", "super", "implements", "interface", "let", "package", "private",
  "protected", "public", "static", "yield", "await", "async",
  "null", "undefined", "true", "false", "NaN", "Infinity",
  "console", "window", "document", "global", "process", "Math", "JSON",
  "Array", "Object", "String", "Number", "Boolean", "Date", "Error",
  "Map", "Set", "Promise", "Symbol", "RegExp",
]);

export class DiagnosticsAnalyzer {
  private nodes: SDKNode[];
  private edges: NodeConnection[];
  private diagnostics: Diagnostic[] = [];

  constructor(nodes: SDKNode[], edges: NodeConnection[]) {
    this.nodes = nodes || [];
    this.edges = edges || [];
  }

  /**
   * Run all analysis rules and return diagnostics.
   */
  public analyze(): Diagnostic[] {
    this.diagnostics = [];

    this.checkDuplicateVariableNames();
    this.checkDuplicateFunctionNames();
    this.checkNameCollisions();
    this.checkEmptyNames();
    this.checkReservedWordNames();
    this.checkConstReassignment();
    this.checkUndeclaredReferences();
    this.checkBreakContinueOutsideLoop();
    this.checkOrphanElse();
    this.checkEmptyScopes();
    this.checkDisconnectedNodes();

    // Sort: errors first, then warnings, then info
    const severityOrder: Record<DiagnosticSeverity, number> = { error: 0, warning: 1, info: 2 };
    this.diagnostics.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return this.diagnostics;
  }

  // --- Helper to push a diagnostic ---
  private add(rule: string, severity: DiagnosticSeverity, message: string, nodeId: string, nodeLabel?: string) {
    this.diagnostics.push({ rule, severity, message, nodeId, nodeLabel });
  }

  // --- Helper to get readable label of a node ---
  private getNodeLabel(node: SDKNode): string {
    const ast = getASTData(node);
    return ast?.params?.name || ast?.params?.funcName || ast?.params?.id || ast?.category || node.id;
  }

  // --- RULE: Duplicate variable names ---
  private checkDuplicateVariableNames(): void {
    const varNodes = this.nodes.filter(n => {
      const ast = getASTData(n);
      return n.type === "variables" && ast?.category === "VARIABLE_DECLARATION";
    });

    const seen = new Map<string, SDKNode>();
    for (const node of varNodes) {
      const ast = getASTData(node);
      const name = ast?.params?.name;
      if (!name) continue;

      const normalizedName = String(name).trim().toLowerCase();
      if (seen.has(normalizedName)) {
        const first = seen.get(normalizedName)!;
        this.add(
          "DUPLICATE_VARIABLE",
          "error",
          `Variável "${name}" já foi declarada anteriormente. Nomes duplicados causam comportamento inesperado.`,
          node.id,
          name
        );
      } else {
        seen.set(normalizedName, node);
      }
    }
  }

  // --- RULE: Duplicate function names ---
  private checkDuplicateFunctionNames(): void {
    const fnNodes = this.nodes.filter(n => {
      const ast = getASTData(n);
      return n.type === "functions" && ast?.category === "FUNCTION_DEFINITION";
    });

    const seen = new Map<string, SDKNode>();
    for (const node of fnNodes) {
      const ast = getASTData(node);
      const name = ast?.params?.name;
      if (!name) continue;

      const normalizedName = String(name).trim().toLowerCase();
      if (seen.has(normalizedName)) {
        this.add(
          "DUPLICATE_FUNCTION",
          "error",
          `Função "${name}" já foi definida anteriormente. Duas funções com o mesmo nome entram em conflito.`,
          node.id,
          name
        );
      } else {
        seen.set(normalizedName, node);
      }
    }
  }

  // --- RULE: Variable and function name collision ---
  private checkNameCollisions(): void {
    const varNames = new Set<string>();
    const fnNames = new Map<string, SDKNode>();

    for (const node of this.nodes) {
      const ast = getASTData(node);
      if (node.type === "variables" && ast?.category === "VARIABLE_DECLARATION") {
        const name = ast?.params?.name;
        if (name) varNames.add(String(name).trim().toLowerCase());
      }
      if (node.type === "functions" && ast?.category === "FUNCTION_DEFINITION") {
        const name = ast?.params?.name;
        if (name) fnNames.set(String(name).trim().toLowerCase(), node);
      }
    }

    for (const [name, node] of fnNames) {
      if (varNames.has(name)) {
        this.add(
          "NAME_COLLISION",
          "error",
          `O nome "${name}" é usado tanto para uma variável quanto para uma função. Isso causa conflito.`,
          node.id,
          name
        );
      }
    }
  }

  // --- RULE: Empty variable/function names ---
  private checkEmptyNames(): void {
    for (const node of this.nodes) {
      const ast = getASTData(node);
      if (node.type === "variables" && ast?.category === "VARIABLE_DECLARATION") {
        const name = ast?.params?.name;
        if (!name || !String(name).trim()) {
          this.add(
            "EMPTY_VARIABLE_NAME",
            "error",
            `Variável declarada sem nome. Toda variável precisa de um nome para ser utilizada.`,
            node.id
          );
        }
      }
      if (node.type === "functions" && ast?.category === "FUNCTION_DEFINITION") {
        const name = ast?.params?.name;
        if (!name || !String(name).trim()) {
          this.add(
            "EMPTY_FUNCTION_NAME",
            "error",
            `Função declarada sem nome. Toda função precisa de um nome para ser chamada.`,
            node.id
          );
        }
      }
    }
  }

  // --- RULE: Reserved words used as names ---
  private checkReservedWordNames(): void {
    for (const node of this.nodes) {
      const ast = getASTData(node);
      const name = ast?.params?.name;
      if (!name) continue;

      const trimmed = String(name).trim();
      if (JS_RESERVED_WORDS.has(trimmed)) {
        const isVar = node.type === "variables" && ast?.category === "VARIABLE_DECLARATION";
        const isFn = node.type === "functions" && ast?.category === "FUNCTION_DEFINITION";
        if (isVar || isFn) {
          this.add(
            "RESERVED_WORD_NAME",
            "error",
            `O nome "${trimmed}" é uma palavra reservada do JavaScript e não pode ser usado como nome de ${isVar ? 'variável' : 'função'}.`,
            node.id,
            trimmed
          );
        }
      }
    }
  }

  // --- RULE: Const reassignment ---
  private checkConstReassignment(): void {
    // Build set of const variable IDs
    const constVarIds = new Set<string>();
    const constVarNames = new Map<string, string>(); // nodeId -> name

    for (const node of this.nodes) {
      const ast = getASTData(node);
      if (node.type === "variables" && ast?.category === "VARIABLE_DECLARATION" && ast?.params?.kind === "const") {
        constVarIds.add(node.id);
        constVarNames.set(node.id, ast.params.name || node.id);
      }
    }

    // Find assignments targeting const variables
    for (const node of this.nodes) {
      const ast = getASTData(node);
      if (ast?.category === "VARIABLE_ASSIGNMENT" || ast?.category === "MATH_OPERATION") {
        const targetId = ast?.params?.varId || ast?.params?.targetVar;
        if (targetId && constVarIds.has(targetId)) {
          const varName = constVarNames.get(targetId) || targetId;
          this.add(
            "CONST_REASSIGNMENT",
            "error",
            `Tentativa de alterar o valor da constante "${varName}". Variáveis declaradas com "const" não podem ser reatribuídas.`,
            node.id,
            varName
          );
        }
      }
    }
  }

  // --- RULE: Undeclared variable/function references ---
  private checkUndeclaredReferences(): void {
    // Collect declared variable IDs and function IDs
    const declaredVarIds = new Set<string>();
    const declaredFnIds = new Set<string>();

    for (const node of this.nodes) {
      const ast = getASTData(node);
      if (node.type === "variables" && ast?.category === "VARIABLE_DECLARATION") {
        declaredVarIds.add(node.id);
      }
      if (node.type === "functions" && ast?.category === "FUNCTION_DEFINITION") {
        declaredFnIds.add(node.id);
      }
    }

    for (const node of this.nodes) {
      const ast = getASTData(node);

      // Check variable assignment references
      if (ast?.category === "VARIABLE_ASSIGNMENT" || ast?.category === "MATH_OPERATION") {
        const targetId = ast?.params?.varId || ast?.params?.targetVar;
        if (targetId && !declaredVarIds.has(targetId)) {
          this.add(
            "UNDECLARED_VARIABLE",
            "warning",
            `Referência a uma variável que não foi declarada neste projeto. Verifique se ela existe.`,
            node.id,
            this.getNodeLabel(node)
          );
        }
      }

      // Check function call references
      if (ast?.category === "FUNCTION_CALL") {
        const funcId = ast?.params?.name || ast?.params?.funcName;
        if (funcId && !declaredFnIds.has(funcId)) {
          this.add(
            "UNDECLARED_FUNCTION",
            "warning",
            `Chamada a uma função que não foi definida neste projeto. Verifique se ela existe.`,
            node.id,
            this.getNodeLabel(node)
          );
        }
      }
    }
  }

  // --- RULE: Break/Continue outside loop ---
  private checkBreakContinueOutsideLoop(): void {
    // Nodes with hasScope that are loops or switches
    const loopLikeCategories = new Set(["FOR_LOOP", "WHILE_LOOP", "SWITCH_STATEMENT"]);
    const loopOnlyCategories = new Set(["FOR_LOOP", "WHILE_LOOP"]);

    // Build set of parent IDs that are loops/switches
    const loopParentIds = new Set<string>();
    const loopOnlyParentIds = new Set<string>();
    for (const node of this.nodes) {
      const ast = getASTData(node);
      if (ast?.category && loopLikeCategories.has(ast.category)) {
        loopParentIds.add(node.id);
      }
      if (ast?.category && loopOnlyCategories.has(ast.category)) {
        loopOnlyParentIds.add(node.id);
      }
    }

    for (const node of this.nodes) {
      const ast = getASTData(node);
      const parentId = node.parentNode || ast?.parentId;

      if (ast?.category === "BREAK_STATEMENT") {
        if (!parentId || !loopParentIds.has(parentId)) {
          this.add(
            "BREAK_OUTSIDE_LOOP",
            "error",
            `O comando "break" só pode ser usado dentro de um laço (for, while) ou switch. Coloque-o dentro de um bloco de repetição.`,
            node.id
          );
        }
      }

      if (ast?.category === "CONTINUE_STATEMENT") {
        if (!parentId || !loopOnlyParentIds.has(parentId)) {
          this.add(
            "CONTINUE_OUTSIDE_LOOP",
            "error",
            `O comando "continue" só pode ser usado dentro de um laço (for, while). Coloque-o dentro de um bloco de repetição.`,
            node.id
          );
        }
      }
    }
  }

  // --- RULE: Orphan else/else-if ---
  private checkOrphanElse(): void {
    for (const node of this.nodes) {
      const ast = getASTData(node);
      if (ast?.category !== "ELSEIF_STATEMENT") continue;

      // Check if there is an execution edge incoming from an IfStatement or ElseIfStatement
      const incomingEdges = this.edges.filter(
        e => e.target === node.id && (e.data?.type === "execution" || !e.data?.type)
      );

      const hasIfPredecessor = incomingEdges.some(edge => {
        const sourceNode = this.nodes.find(n => n.id === edge.source);
        if (!sourceNode) return false;
        const sourceAst = getASTData(sourceNode);
        return sourceAst?.category === "IF_STATEMENT" || sourceAst?.category === "ELSEIF_STATEMENT";
      });

      if (!hasIfPredecessor) {
        this.add(
          "ORPHAN_ELSE",
          "warning",
          `Bloco "Senão Se" não está conectado a um bloco "Se" anterior. Ele será convertido em um "Se" independente.`,
          node.id,
          this.getNodeLabel(node)
        );
      }
    }
  }

  // --- RULE: Empty scopes (blocks with no children) ---
  private checkEmptyScopes(): void {
    for (const node of this.nodes) {
      const ast = getASTData(node);
      if (!ast?.hasScope) continue;

      // Check if any node has this node as parentNode/parentId
      const hasChildren = this.nodes.some(n => {
        const childParent = n.parentNode || getASTData(n)?.parentId;
        return childParent === node.id;
      });

      // Also check if any execution edge leaves this node toward a child
      if (!hasChildren) {
        const label = this.getNodeLabel(node);
        this.add(
          "EMPTY_SCOPE",
          "info",
          `O bloco "${label}" está vazio — não possui nenhum nó dentro do seu escopo.`,
          node.id,
          label
        );
      }
    }
  }

  // --- RULE: Disconnected nodes (no execution edges) ---
  private checkDisconnectedNodes(): void {
    // Variable declarations don't need execution edges (they're static at the top)
    const executionNodes = this.nodes.filter(n => {
      const ast = getASTData(n);
      return ast?.category !== "VARIABLE_DECLARATION";
    });

    for (const node of executionNodes) {
      const ast = getASTData(node);
      if (!ast?.category) continue; // Skip nodes without AST data

      // A node with a parentId (scoped inside another block) is considered connected
      const parentId = node.parentNode || ast?.parentId;
      if (parentId) continue;

      const hasIncoming = this.edges.some(
        e => e.target === node.id && (e.data?.type === "execution" || !e.data?.type)
      );
      const hasOutgoing = this.edges.some(
        e => e.source === node.id && (e.data?.type === "execution" || !e.data?.type)
      );

      if (!hasIncoming && !hasOutgoing) {
        const label = this.getNodeLabel(node);
        this.add(
          "DISCONNECTED_NODE",
          "info",
          `O nó "${label}" não está conectado a nenhum fluxo de execução. Ele não será executado.`,
          node.id,
          label
        );
      }
    }
  }
}
