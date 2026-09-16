/**
 * Dicionário de traduções e estilos visuais para os nós do editor de fluxo.
 */

export interface CategoryVisualConfig {
  primary: string;
  bgBadge: string;
  border: string;
  glow: string;
  label: string;
  singular: string;
  defaultIcon: string;
}

export const categoryVisuals: Record<string, CategoryVisualConfig> = {
  variables: {
    primary: "#06b6d4", // Cyan
    bgBadge: "rgba(6, 182, 212, 0.12)",
    border: "rgba(6, 182, 212, 0.35)",
    glow: "rgba(6, 182, 212, 0.25)",
    label: "Variáveis",
    singular: "Variável",
    defaultIcon: "abc",
  },
  logics: {
    primary: "#8b5cf6", // Violet
    bgBadge: "rgba(139, 92, 246, 0.12)",
    border: "rgba(139, 92, 246, 0.35)",
    glow: "rgba(139, 92, 246, 0.25)",
    label: "Lógicas",
    singular: "Lógica",
    defaultIcon: "alt_route",
  },
  functions: {
    primary: "#f59e0b", // Amber
    bgBadge: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.35)",
    glow: "rgba(245, 158, 11, 0.25)",
    label: "Funções",
    singular: "Função",
    defaultIcon: "functions",
  },
};

export const defaultVisualConfig: CategoryVisualConfig = {
  primary: "#3b82f6",
  bgBadge: "rgba(59, 130, 246, 0.12)",
  border: "rgba(59, 130, 246, 0.35)",
  glow: "rgba(59, 130, 246, 0.25)",
  label: "Blocos",
  singular: "Bloco",
  defaultIcon: "grid_view",
};

/**
 * Tradução dos nomes das categorias / operações AST para português
 */
export const nodeCategoryLabels: Record<string, string> = {
  VARIABLE_DECLARATION: "Declaração de Variável",
  VARIABLE_ASSIGNMENT: "Atribuição de Valor",
  MATH_OPERATION: "Operação Matemática",
  IF_STATEMENT: "Condicional Se",
  ELSEIF_STATEMENT: "Condicional Senão Se",
  FOR_LOOP: "Laço de Repetição (For)",
  WHILE_LOOP: "Laço de Repetição (While)",
  BREAK_STATEMENT: "Interromper Laço (Break)",
  CONTINUE_STATEMENT: "Pular Iteração (Continue)",
  SWITCH_STATEMENT: "Escolha (Switch)",
  CASE_CONDITION: "Caso de Escolha (Case)",
  CASE_DEFAULT: "Caso Padrão (Default)",
  FUNCTION_DEFINITION: "Definição de Função",
  FUNCTION_CALL: "Chamada de Função",
  FUNCTION_RETURN: "Retorno de Valor",
  CONSOLE_LOG: "Imprimir no Console",
};

/**
 * Ícones específicos para cada operação
 */
export const nodeCategoryIcons: Record<string, string> = {
  VARIABLE_DECLARATION: "add_box",
  VARIABLE_ASSIGNMENT: "edit",
  MATH_OPERATION: "calculate",
  IF_STATEMENT: "alt_route",
  ELSEIF_STATEMENT: "call_split",
  FOR_LOOP: "repeat",
  WHILE_LOOP: "sync",
  BREAK_STATEMENT: "cancel",
  CONTINUE_STATEMENT: "skip_next",
  SWITCH_STATEMENT: "switch_access_shortcut",
  CASE_CONDITION: "subdirectory_arrow_right",
  CASE_DEFAULT: "subdirectory_arrow_right",
  FUNCTION_DEFINITION: "function",
  FUNCTION_CALL: "play_circle",
  FUNCTION_RETURN: "keyboard_return",
  CONSOLE_LOG: "terminal",
};

/**
 * Tradução dos campos (parâmetros de configuração dos nós)
 */
export const nodeFieldLabels: Record<string, string> = {
  // Variáveis
  kind: "Tipo de Declaração",
  name: "Nome",
  value: "Valor",
  varId: "Variável",
  targetVar: "Salvar em",
  valA: "Valor A",
  valB: "Valor B",
  operator: "Operador",

  // Lógicas
  condition: "Condição",
  iterator: "Contador",
  iteratorName: "Contador",
  start: "Início",
  startValue: "Início",
  step: "Passo",
  expression: "Expressão",
  parentId: "Vínculo",

  // Funções
  isAsync: "Assíncrona",
  args: "Parâmetros",
  arguments: "Argumentos",
  funcName: "Função",
  await: "Aguardar (await)",
  shouldAwait: "Aguardar (await)",
  message: "Mensagem",

  // Propriedades gerais de nós
  position: "Posição",
  data: "Dados",
  params: "Parâmetros",
  type: "Tipo",
  category: "Categoria",
  hasScope: "Possui Escopo",
  autoBreak: "Quebra Automática",
  isExpression: "Expressão",
  id: "ID",
  x: "X",
  y: "Y",
};

/**
 * Retorna o rótulo traduzido da categoria
 */
export function translateCategory(category?: string | null): string {
  if (!category) return "Nó Personalizado";
  if (nodeCategoryLabels[category]) return nodeCategoryLabels[category];

  // Caso seja um identificador personalizado, limpa snake_case
  return category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Retorna o ícone representativo do nó ou da sua categoria
 */
export function getNodeIcon(category?: string | null, type?: string | null): string {
  if (category && nodeCategoryIcons[category]) {
    return nodeCategoryIcons[category];
  }
  if (type && categoryVisuals[type]?.defaultIcon) {
    return categoryVisuals[type].defaultIcon;
  }
  return defaultVisualConfig.defaultIcon;
}

/**
 * Retorna a tradução do nome de um campo em português
 */
export function translateField(fieldName: string): string {
  if (nodeFieldLabels[fieldName]) {
    return nodeFieldLabels[fieldName];
  }

  // Tenta converter camelCase para palavras legíveis
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export interface FormattedParamValue {
  text: string;
  isCode?: boolean;
  isBool?: boolean;
  boolValue?: boolean;
}

/**
 * Formata o valor de um campo para exibição em português
 */
export function formatFieldValue(val: any): FormattedParamValue {
  if (val === null || val === undefined) {
    return { text: "nulo", isCode: true };
  }

  if (typeof val === "boolean") {
    return {
      text: val ? "Sim" : "Não",
      isBool: true,
      boolValue: val,
    };
  }

  if (Array.isArray(val)) {
    if (val.length === 0) return { text: "(vazio)", isCode: true };
    if (typeof val[0] === "object" && val[0] !== null) {
      const expr = val
        .map((item: any) => item.text ?? item.value ?? item.name ?? "")
        .filter(Boolean)
        .join(" ");
      return { text: expr || "(vazio)", isCode: true };
    }
    return { text: val.join(", "), isCode: true };
  }

  if (typeof val === "object") {
    const expr = val.text ?? val.value ?? val.name;
    if (expr !== undefined && expr !== null) {
      return { text: String(expr), isCode: true };
    }
    try {
      return { text: JSON.stringify(val), isCode: true };
    } catch {
      return { text: String(val) };
    }
  }

  const strVal = String(val);
  // Identifica se parece com expressão ou identificador de código
  const isCode =
    /^(let|const|var|\+|\-|\*|\/|\%|\=\=|\=\=\=|\!\=|\<|\>|\<\=|\>\=|\&\&|\|\|)/.test(strVal) ||
    /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(strVal);

  return { text: strVal, isCode };
}
