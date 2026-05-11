import {
	AritmeticOperators,
	ComparisonOperators,
	LogicalOperators,
	type SDKNode,
} from "../";

export default (ctx: { variables: SDKNode[]; logics: SDKNode[] }) => ({
	text: "Lógicas de Controle",
	icon: "alt_route",
	definitions: {
		if: {
			text: "Se",
			icon: "alt_route",
			category: "logic",
			params: [
				{
					key: "condition",
					label: "Condição",
					type: "complex-array",
					items: [
						{
							key: "variable",
							label: "Variável",
							type: "select",
							items: ctx.variables,
						},
						{
							key: "arithmetic",
							label: "Operadores Aritméticos",
							type: "select",
							items: AritmeticOperators,
						},
						{
							key: "comparison",
							label: "Operadores de Comparação",
							type: "select",
							items: ComparisonOperators,
						},
						{
							key: "logical",
							label: "Operadores Lógicos",
							type: "select",
							items: LogicalOperators,
						},
					],
					required: true,
				},
			],
			execute: (p: any) => ({
				type: "IF_STATEMENT",
				params: { condition: p.condition },
				hasScope: true, // indica que deve esperar um corpo
			}),
		},

		elseIf: {
			text: "Senão Se",
			icon: "call_split",
			category: "logic",
			params: [
				{
					key: "condition",
					label: "Condição",
					type: "complex-array",
					items: [
						{
							key: "variable",
							label: "Variável",
							type: "select",
							items: ctx.variables,
						},
						{
							key: "arithmetic",
							label: "Operadores Aritméticos",
							type: "select",
							items: AritmeticOperators,
						},
						{
							key: "comparison",
							label: "Operadores de Comparação",
							type: "select",
							items: ComparisonOperators,
						},
						{
							key: "logical",
							label: "Operadores Lógicos",
							type: "select",
							items: LogicalOperators,
						},
					],
					required: true,
				},
			],
			execute: (p: any) => ({
				type: "ELSEIF_STATEMENT",
				params: { condition: p.condition },
				hasScope: true,
			}),
		},

		forLoop: {
			text: "Laço For",
			icon: "repeat",
			category: "logic",
			params: [
				{
					key: "init",
					label: "Início",
					type: "complex-array",
					items: [
						{
							key: "variable",
							label: "Variável",
							type: "select",
							items: ctx.variables,
							required: true,
						},
						{
							key: "arithmetic",
							label: "Operadores Aritméticos",
							type: "select",
							items: AritmeticOperators,
						},
						{
							key: "comparison",
							label: "Operadores de Comparação",
							type: "select",
							items: ComparisonOperators,
						},
						{
							key: "logical",
							label: "Operadores Lógicos",
							type: "select",
							items: LogicalOperators,
						},
					],
				},
				{
					key: "condition",
					label: "Condição",
					type: "complex-array",
					items: [
						{
							key: "variable",
							label: "Variável",
							type: "select",
							items: ctx.variables,
						},
						{
							key: "arithmetic",
							label: "Operadores Aritméticos",
							type: "select",
							items: AritmeticOperators,
						},
						{
							key: "comparison",
							label: "Operadores de Comparação",
							type: "select",
							items: ComparisonOperators,
						},
						{
							key: "logical",
							label: "Operadores Lógicos",
							type: "select",
							items: LogicalOperators,
						},
					],
					default: "0",
				},
				{
					key: "increment",
					label: "Incremento",
					type: "complex-array",
					default: [],
				},
			],
			execute: (p: any) => ({
				type: "FOR_LOOP",
				params: {
					setup: p.init,
					condition: p.condition,
					step: p.increment,
				},
				hasScope: true,
			}),
		},

		switchCase: {
			text: "Escolha (Switch)",
			icon: "switch_access_shortcut",
			category: "logic",
			params: [
				{
					key: "expression",
					label: "Variável/Expressão",
					type: "complex-array",
					required: true,
				},
			],
			execute: (p: any) => ({
				type: "SWITCH_STATEMENT",
				params: { expression: p.expression },
				hasScope: true,
			}),
		},

		switchCaseOption: {
			text: "Caso (Case)",
			icon: "subdirectory_arrow_right",
			category: "logic",
			params: [{ key: "value", label: "Valor", type: "text", required: true }],
			execute: (p: any) => ({
				type: "CASE_CONDITION",
				params: { value: p.value },
				autoBreak: true,
			}),
		},

		switchCaseDefault: {
			text: "Caso Padrão (Default)",
			icon: "subdirectory_arrow_right",
			category: "logic",
			params: [],
			execute: (p: any) => ({
				type: "CASE_DEFAULT",
				params: {},
				autoBreak: true,
			}),
		},
	},
});
