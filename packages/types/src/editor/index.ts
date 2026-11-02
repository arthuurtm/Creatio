// Editor: re-exporta tipos do rete-studio-core e o adapter
export * from "./models";

import type { JSONBaseNode, JSONEditorData } from "./models";

export interface FileInfo {
	id: number | null;
	title: string;
	version: string;
	description: string | null;
	updatedAt: Date | number | null;
}

export type EditorNodeWithPosition = JSONBaseNode & {
	position?: { x: number; y: number };
};

export type EditorState = Omit<JSONEditorData, "nodes"> & {
	nodes: EditorNodeWithPosition[];
};
