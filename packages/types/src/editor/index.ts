// Editor: re-exporta tipos do rete-studio-core e o adapter
export * from "./models";

import type { JSONEditorData } from "./models";

export interface FileInfo {
	id: number | null;
	title: string;
	version: string;
	description: string | null;
	updatedAt: Date | number | null;
}

export type EditorState = JSONEditorData & {
	info: FileInfo;
  [key: string]: any;
};
