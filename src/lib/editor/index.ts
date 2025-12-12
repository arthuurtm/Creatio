import { actions } from './actions'
import { events } from './events'
import { conditions } from './conditions'
import { consequences } from './consequences'
import { objects } from './objects'
import { quests } from './quests'
import { skills } from './skills'
import { assets } from './assets'
import { nodes } from './nodes'
import type {
  CategoryConfig,
  CategoryKey,
  EditorDefinition,
  FallbackItem,
} from '@/types/editor-config'
import type { ComputedRef } from 'vue'

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
}

/**
 * @abstract Extrai o mapa de definições (subcategorias) de uma categoria principal.
 */
export function getSubCategories(
  categoryKey: CategoryKey,
): Record<string, EditorDefinition> | FallbackItem[] {
  return metadata[categoryKey]?.value?.definitions ?? {}
}

// Exporta os dados diretamente
export { actions, events, conditions, consequences, objects, quests, skills, assets, nodes }
export const categories = metadata
