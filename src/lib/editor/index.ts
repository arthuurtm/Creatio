import type { ComputedRef } from "vue";
import type {
	CategoryConfig,
	CategoryKey,
	EditorDefinition,
	FallbackItem,
} from "#types/domain/editor/index.ts";
import { actions } from "./actions";
import { assets } from "./assets";
import { conditions } from "./conditions";
import { consequences } from "./consequences";
import { events } from "./events";
import { nodes } from "./nodes";
import { objects } from "./objects";
import { quests } from "./quests";
import { skills } from "./skills";

const metadata: Record<CategoryKey, ComputedRef<CategoryConfig>> = {
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
	return metadata[categoryKey]?.value?.definitions ?? {};
}

// Exporta os dados diretamente
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
export const categories = metadata;
