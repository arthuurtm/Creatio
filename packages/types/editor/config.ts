import type { EditorState } from "./models";

export interface CategoryConfig<
	T extends Record<string, EditorDefinition> = Record<string, EditorDefinition>,
> {
	text: string;
	icon: string;
	definitions: T;
}

export interface FallbackItem {
	text: string;
	icon?: string;
}

export interface EditorDefinition<T = Record<string, any>> {
	text: string;
	icon: string;
	execute: (params: T) => string | void;
}

// cria definições sem perder a tipagem
export function createDefinitions<T extends Record<string, EditorDefinition>>(
	defs: T,
) {
	return defs;
}

export type CategoryKey =
	| "actions"
	| "events"
	| "conditions"
	| "consequences"
	| "objects"
	| "quests"
	| "skills"
	| "assets"
	| "nodes";

export const categories: Record<CategoryKey, CategoryConfig> = {
	actions,
	events,
	conditions,
	consequences,
	objects,
	quests,
	skills,
	assets,
	nodes,
};

/**
 * @abstract Extrai o mapa de definições (subcategorias) de uma categoria principal.
 */
export function getSubCategories(
	categoryKey: CategoryKey,
): Record<string, EditorDefinition> | FallbackItem[] {
	return categories[categoryKey]?.definitions ?? [];
}

export function normalizeItems(param: any) {
	const items = param.items;
	if (!items) return items;
	if (typeof items[0] === "string") return items;
	return items.map((i) => ({
		title: i.name ?? i.text ?? i.label ?? i.title ?? i.id,
		value: i.id ?? i.key ?? i.value ?? i.name ?? i.text,
		raw: i,
	}));
}

export interface EditorContext extends EditorState {
	onExecute: (code: string) => void;
}

export type {
	actions,
	events,
	conditions,
	consequences,
	objects,
	quests,
	skills,
	assets,
	nodes,
};
