import {
	type EditorState,
	functions,
	logics,
	nodes,
	variables,
} from "./models";

export interface ASTNode {
	type: string;
	params?: Record<string, any>;
	hasScope?: boolean;
	isExpression?: boolean;
}

export interface CategoryConfig<
	T extends Record<string, EditorDefinition> = Record<string, EditorDefinition>,
> {
	text: string;
	icon: string;
	definitions: T;
}

export interface EditorDefinition<T = Record<string, any>> {
	text: string;
	icon: string;
	category?: string;
	params?: any[];
	execute: (params: T) => ASTNode;
}

export const categories = {
	functions,
	logics,
	variables,
	nodes,
};

export type CategoryKey = keyof typeof categories;

/**
 * @abstract Extrai o mapa de definições (subcategorias) de uma categoria principal.
 */
export function getCategory(
	categoryKey: CategoryKey,
	context: EditorState,
): CategoryConfig | [] {
	return categories[categoryKey](context) ?? [];
}

/**
 * @abstract Normaliza itens para os Selects da Interface do Usuário
 */
export function normalizeItems(param: any) {
	const items = param.items;
	if (!items) return items;
	if (typeof items[0] === "string") return items;
	return items.map((i: any) => ({
		title: i.name ?? i.text ?? i.label ?? i.title ?? i.id,
		value: i.id ?? i.key ?? i.value ?? i.name ?? i.text,
		items: i.items ?? undefined,
		raw: i,
	}));
}
export interface EditorContext extends EditorState {}
