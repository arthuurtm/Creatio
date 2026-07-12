/**
 * Palavras reservadas
 * **/
export const Keywords = {
	LET: "let",
	CONST: "const",
	IF: "if",
	ELSE: "else",
	FUNCTION: "function",
	RETURN: "return",
} as const;

/**
 * Operadores aritméticos, lógicos e de comparação
 * **/
export const AritmeticOperators = {
	ADD: "+",
	SUB: "-",
	MUL: "*",
	DIV: "/",
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
