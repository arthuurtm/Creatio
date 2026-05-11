import {
	type FileInfo,
	functions,
	logics,
	type NodeBlueprint,
	type NodeConnection,
	type SDKNode,
	type SDKNodeType,
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

export interface EditorDefinitionParams {
	key: string;
	label: string;
	type: string;
	items?: any[];
	required?: boolean;
}

export interface EditorDefinition {
	text: string;
	icon: string;
	category: SDKNodeType;
	params?: EditorDefinitionParams[];
	execute?: (p: Record<string, any>) => NodeBlueprint;
}

export const categories = {
	functions,
	logics,
	variables,
};

export type CategoryKey = keyof typeof categories;

export interface EditorState {
	info: FileInfo;
	nodes: Record<string, SDKNode>;
	indexes: {
		[K in CategoryKey]: string[];
	};
	connections: NodeConnection[];
}

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
