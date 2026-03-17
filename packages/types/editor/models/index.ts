export type SDKNodeType =
	| "event" // blocos de início (verde) - ex: ao Iniciar
	| "statement" // blocos de ação (azul) - ex: atribuir variável, chamar função
	| "logic" // blocos de controle (laranja)
	| "loop" // blocos de repetição (roxo)
	| "expression"; // blocos de valor (cinza)

export interface SDKNode {
	id: string;
	type: string;
	category: SDKNodeType;
	position: { x: number; y: number };
	data: Record<string, any>;
}

export interface NodeConnection {
	id: string;
	sourceNode: string;
	sourceHandle?: string;
	targetNode: string;
	targetHandle?: string;
	type?: "execution" | "data";
}

// export interface UserVariable {
// 	id: string;
// 	name: string;
// 	dataType: "string" | "number" | "boolean" | "array" | "object";
// 	defaultValue: any;
// 	isConstant: boolean;
// }

// export interface UserFunction {
// 	id: string;
// 	name: string;
// 	parameters: { name: string; type: string }[];
// 	returnType: string | null;
// 	entryNodeId: string;
// }

export interface FileInfo {
	id: number | null;
	title: string;
	version: string;
	description: string | null;
	updatedAt: Date | number | null;
}

export interface EditorState {
	info: FileInfo;
	variables: any[];
	functions: any[];
	logics: any[];
	nodes: SDKNode[];
	connections: NodeConnection[];
}

export { default as functions } from "./functions";
export { default as logics } from "./logics";
export { default as nodes } from "./nodes";
export { default as variables } from "./variables";
