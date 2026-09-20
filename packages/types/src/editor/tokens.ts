/**
 * Palavras reservadas
 * **/
export const DeclarationKeywords = {
  LET: "let",
  CONST: "const",
  VAR: "var",
} as const;

export const ControlFlowKeywords = {
  IF: "if",
  ELSE: "else",
  RETURN: "return",
} as const;

export const FunctionKeywords = {
  FUNCTION: "function",
} as const;

/**
 * Operadores aritméticos, lógicos e de comparação
 * **/
export const AritmeticOperators = {
	SUM: "+",
	SUB: "-",
	MUL: "*",
	DIV: "/",
  MOD: "%",
} as const;

export const ComparisonOperators = {
	EQ: "===",
	NEQ: "!==",
	GT: ">",
	LT: "<",
	GTE: ">=",
	LTE: "<=",
} as const;

export const LogicalOperators = {
	AND: "&&",
	OR: "||",
	NOT: "!",
} as const;
