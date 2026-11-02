import type { Schemes } from "@projeto/types";
import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";

/**
 * Serializa o editor de forma segura: usa c.serialize() se disponível (Connection do
 * rete-studio-core), ou faz fallback manual para conexões sem o método (ClassicPreset.Connection).
 * Se a instância de `area` for fornecida, anexa a posição visual (x, y) de cada nó.
 */
export function safeSerialize(
	editor: NodeEditor<Schemes>,
	area?: AreaPlugin<Schemes, any> | null,
) {
	return {
		nodes: editor.getNodes().map((n) => {
			const serialized = n.serialize();
			const view = area?.nodeViews?.get(n.id);
			return {
				...serialized,
				position: view?.position ? { x: view.position.x, y: view.position.y } : undefined,
			};
		}),
		connections: editor.getConnections().map((c) => {
			if (typeof (c as any).serialize === "function")
				return (c as any).serialize();
			// Fallback para ClassicPreset.Connection (sem serialize)
			return {
				id: c.id,
				source: c.source,
				sourceOutput: c.sourceOutput,
				target: c.target,
				targetInput: c.targetInput,
			};
		}),
	};
}
