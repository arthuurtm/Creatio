import type { ComputedRef } from "vue";
import type {
	CategoryConfig,
	CategoryKey,
	EditorDefinition,
	FallbackItem,
} from "@projeto/types";
import { actions } from "./actions";
import { assets } from "./assets";
import { conditions } from "./conditions";
import { consequences } from "./consequences";
import { events } from "./events";
import { nodes } from "./nodes";
import { objects } from "./objects";
import { quests } from "./quests";
import { skills } from "./skills";

export const categories: Record<CategoryKey, ComputedRef<CategoryConfig>> = {
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
	return categories[categoryKey]?.value?.definitions ?? {};
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

export {
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
