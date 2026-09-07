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
  options?: any[];
  items?: any[];
  required?: boolean;
  default?: any;
}

export interface EditorDefinition {
  text: string;
  icon: string;
  description?: string;
  preview?: string;
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

export interface NormalizedOption {
	label: string;
	value: string;
	raw?: unknown;
}

export type NormalizedItem = NormalizedOption;

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
 * Normaliza options de parâmetros para os Selects do Naive UI.
 * Aceita strings puras ou objetos com diferentes formas.
 */
export function normalizeOptions(
	param: EditorDefinitionParam,
): NormalizedOption[] | undefined {
	const rawOptions = param.options ?? param.items;

	if (!rawOptions?.length) return rawOptions;

	if (typeof rawOptions[0] === "string") {
		return rawOptions.map((opt) => ({
			label: opt,
			value: opt,
		}));
	}

	return rawOptions.map((opt: any) => ({
		label: opt.data?.params?.name ?? opt.data?.category ?? opt.label ?? opt.text ?? opt.id,
		value: opt.id ?? opt.value,
		raw: opt,
	}));
}

export const normalizeItems = normalizeOptions;
