import type { EditorState } from ".";

export default (ctx: EditorState) => ({
	text: "Nós do Canvas",
	icon: "account_tree",
	definitions: {
		createEventBlock: {
			text: "Gatilho / Evento de Início",
			icon: "play_arrow",
			category: "nodes",
			params: [],
			execute: (p: { x: number; y: number; eventType?: string }) => ({
				id: crypto.randomUUID(),
				category: "event",
				type: p.eventType || "onStart",
				position: { x: p.x, y: p.y },
				data: {},
			}),
		},

		createCommentBlock: {
			text: "Comentário (Visual)",
			icon: "notes",
			category: "nodes",
			params: [],
			execute: (p: { x: number; y: number }) => ({
				id: crypto.randomUUID(),
				category: "comment",
				type: "commentNode",
				position: { x: p.x, y: p.y },
				data: {
					text: "Descreva este bloco de código...",
				},
			}),
		},

		createFunctionEntry: {
			text: "Entrada de Função",
			icon: "login",
			category: "nodes",
			params: [],
			execute: (p: { x: number; y: number; funcId?: string }) => ({
				id: crypto.randomUUID(),
				category: "function_entry",
				type: "functionStart",
				position: { x: p.x, y: p.y },
				data: {
					funcId: p.funcId || null,
				},
			}),
		},
	},
});
