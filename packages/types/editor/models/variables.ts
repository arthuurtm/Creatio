import type { EditorState } from ".";

export default (ctx: EditorState) => ({
	text: "Variáveis",
	icon: "abc",
	definitions: {
		declare: {
			text: "Declarar Variável",
			icon: "add_box",
			category: "variables",
			params: [
				{
					key: "kind",
					label: "Tipo",
					type: "select",
					items: ["const", "let", "var"],
					default: "let",
				},
				{ key: "name", label: "Nome", type: "text", required: true },
				{
					key: "value",
					label: "Valor Inicial",
					type: "string",
					default: "null",
				},
			],
			execute: (p: any) => ({
				type: "VARIABLE_DECLARATION",
				params: {
					kind: p.kind,
					name: p.name,
					value: p?.value,
				},
			}),
		},
		assign: {
			text: "Atribuir Valor",
			icon: "edit",
			category: "variables",
			params: [
				{
					key: "varId",
					label: "Variável",
					type: "select",
					items: ctx.variables,
					required: true,
				},
				{ key: "value", label: "Novo Valor", type: "string", required: true },
			],
			execute: (p: any) => ({
				type: "VARIABLE_ASSIGNMENT",
				params: {
					varId: p.name,
					value: p.value,
				},
			}),
		},
	},
});
