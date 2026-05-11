export type SDKNodeType = "variables" | "functions" | "logics";

export interface NodeBlueprint {
	type: string;
	params: Record<string, unknown>;
	hasScope?: boolean;
}

export interface SDKNode extends NodeBlueprint {
	id: string;
	type: string;
	category: SDKNodeType;
	position: { x: number; y: number };
	data?: Record<string, any>;
}

export interface NodeConnection {
	id: string;
	source: string;
	sourceHandle?: string;
	target: string;
	targetHandle?: string;
	type?: "execution" | "data";
	markerEnd?: string;
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

export { default as functions } from "./functions";
export { default as logics } from "./logics";
export { default as variables } from "./variables";
