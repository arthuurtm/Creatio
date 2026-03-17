import { AritmeticOperators, ComparisonOperators, LogicalOperators } from "../";
import type { EditorState } from ".";

export default (ctx: EditorState) => ({
	text: "Funções",
	icon: "functions",
	definitions: {
		defineFunction: {
			text: "Definir Função",
			icon: "function",
			category: "functions",
			params: [
				{
					key: "name",
					label: "Nome da Função",
					type: "text",
					required: true,
				},
				{
					key: "isAsync",
					label: "Assíncrona?",
					type: "switch",
					default: false,
				},
				{
					key: "args",
					label: "Parâmetros",
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
				},
			],
			execute: (p: any) => ({
				type: "FUNCTION_DEFINITION",
				params: {
					name: p.name,
					isAsync: p.isAsync,
					arguments: p.args
						? p.args.split(",").map((a: string) => a.trim())
						: [],
				},
				hasScope: true,
			}),
		},

		callFunction: {
			text: "Chamar Função",
			icon: "play_circle",
			category: "functions",
			params: [
				{
					key: "funcName",
					label: "Função",
					type: "select",
					items: ctx.functions,
					required: true,
				},
				{
					key: "shouldAwait",
					label: "Esperar (await)?",
					type: "switch",
					default: false,
				},
				{ key: "args", label: "Valores", type: "string" },
			],
			execute: (p: any) => ({
				type: "FUNCTION_CALL",
				params: {
					name: p.funcName,
					await: p.shouldAwait,
					arguments: p.args,
				},
				isExpression: true,
			}),
		},

		returnValue: {
			text: "Retornar Valor",
			icon: "keyboard_return",
			category: "functions",
			params: [{ key: "value", label: "Valor", type: "string" }],
			execute: (p: any) => ({
				type: "RETURN_STATEMENT",
				params: {
					value: p.value || "undefined",
				},
			}),
		},
	},
});
