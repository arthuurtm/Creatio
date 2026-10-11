import type { Schemes } from "@projeto/types";
import type { NodeEditor } from "rete";

/**
 * Serializa o editor de forma segura: usa c.serialize() se disponível (Connection do
 * rete-studio-core), ou faz fallback manual para conexões sem o método (ClassicPreset.Connection).
 */
export function safeSerialize(editor: NodeEditor<Schemes>) {
	return {
		nodes: editor.getNodes().map((n) => n.serialize()),
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
