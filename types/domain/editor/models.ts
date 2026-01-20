// Defina interfaces reais baseadas no que seus objetos têm.
// Use 'any' APENAS temporariamente onde não tiver certeza ainda.
export type GameNodeType = "dialog" | "combat" | "event";

export interface GameNode {
	id: string;
	type: GameNodeType;
	position: { x: number; y: number };
	[key: string]: any;
}
export interface GameConnection {
	id: string;
	source: string;
	target: string;
}
export interface GameInfo {
	id: string | null;
	title: string;
	version: string;
	description: string | null;
	updatedAt: Date | number | null;
}
export interface GameObject {
	id: string;
	name: string;
	[key: string]: any;
}
export interface GameAvatar {
	id: string;
	name: string;
	[key: string]: any;
}
export interface GameAction {
	id: string;
	trigger: string;
	payload: Record<string, any>;
}

// O Estado completo do Editor
export interface EditorState {
	nodes: GameNode[];
	connections: GameConnection[];
	info: GameInfo;
	objects: GameObject[];
	avatars: GameAvatar[];
	flags: any[];
	statuses: any[];
	skills: any[];
	companions: any[];
	quests: any[];
	assets: any[];
	conditions: any[];
	consequences: any[];
	events: any[];
	actions: any[];
}
