import {
  functions,
  logics,
  variables,
  type SDKNodeType,
  type ExecuteResult,
  type EditorContext,
  type CategoryKey,
} from './models';

export interface EditorDefinitionParam {
  key: string;
  label: string;
  type: string;
  items?: any[];
  required?: boolean;
  default?: any;
}

export interface EditorDefinition {
  text: string;
  icon: string;
  params?: EditorDefinitionParam[];
  execute?: (p: Record<string, any>) => ExecuteResult;
}

export interface CategoryConfig<
  T extends Record<string, EditorDefinition> = Record<string, EditorDefinition>,
> {
  text: string;
  icon: string;
  definitions: T;
}


export const categories: Record<SDKNodeType, (ctx: EditorContext) => CategoryConfig> = {
  functions,
  logics,
  variables,
};

/**
 * Retorna a configuração de uma categoria com suas definições.
 */
export function getCategory(categoryKey: CategoryKey, context: EditorContext): CategoryConfig {
  return categories[categoryKey](context);
}

/**
 * Normaliza items de parâmetros para os Selects da UI.
 * Aceita strings puras ou objetos com diferentes formas.
 */
export function normalizeItems(param: EditorDefinitionParam) {
  const items = param.items;
  if (!items || items.length === 0) return items;
  if (typeof items[0] === 'string') return items;

  return items.map((i: any) => ({
  title: i.data?.params?.name ?? i.data?.category ?? i.id,
  value: i.id,
  raw: i,
}));
}
