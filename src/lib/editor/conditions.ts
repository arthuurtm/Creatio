import { computed } from "vue";
import { generateId, useEditorStore } from "@/stores/editor.ts";
import { createDefinitions } from "@/types/editor-config";

export const conditions = computed(() => {
	const editorStore = useEditorStore();

	function pushCondition(type: string, params: any) {
		const id = generateId("cond");
		const condition = { id, type, ...params };
		editorStore.conditions.push(condition);
		return id;
	}

	const definitions = createDefinitions({
		// --- Personagem / Inventário ---
		hasItem: {
			text: "Item",
			icon: "inventory",
			params: [
				{
					key: "itemId",
					label: "Item",
					type: "select",
					options: editorStore.objects,
					required: true,
				},
				{
					key: "quantity",
					label: "Quantidade Mínima",
					type: "number",
					default: 1,
				},
				{
					key: "playerId",
					label: "Jogador",
					type: "select",
					options: editorStore.avatars,
				},
			],
			execute: (params) => pushCondition("has", { subtype: "item", ...params }),
		},
		hasCurrency: {
			text: "Moeda",
			icon: "attach_money",
			params: [
				{
					key: "currencyType",
					label: "Tipo de Moeda",
					type: "text",
					default: "gold",
				},
				{
					key: "amount",
					label: "Quantidade Mínima",
					type: "number",
					default: 1,
				},
				{
					key: "playerId",
					label: "Jogador",
					type: "select",
					options: editorStore.avatars,
				},
			],
			execute: (params) =>
				pushCondition("has", { subtype: "currency", ...params }),
		},
		hasStatus: {
			text: "Status",
			icon: "medication",
			params: [
				{
					key: "statusId",
					label: "Status",
					type: "select",
					options: editorStore.statuses,
					required: true,
				},
				{ key: "active", label: "Ativo?", type: "boolean", default: true },
				{
					key: "playerId",
					label: "Jogador",
					type: "select",
					options: editorStore.avatars,
				},
			],
			execute: (params) =>
				pushCondition("has", { subtype: "status", ...params }),
		},
		hasAttribute: {
			text: "Atributo",
			icon: "bar_chart",
			params: [
				{
					key: "attribute",
					label: "Atributo (ex: FOR)",
					type: "text",
					required: true,
				},
				{
					key: "comparator",
					label: "Comparador",
					type: "select",
					options: [">=", "<=", "==", ">", "<", "!="],
					default: ">=",
				},
				{ key: "value", label: "Valor", type: "text", required: true },
				{
					key: "playerId",
					label: "Jogador",
					type: "select",
					options: editorStore.avatars,
				},
			],
			execute: (params) =>
				pushCondition("has", { subtype: "attribute", ...params }),
		},
		hasSkill: {
			text: "Habilidade",
			icon: "school",
			params: [
				{
					key: "skillId",
					label: "Habilidade",
					type: "select",
					options: editorStore.skills,
					required: true,
				},
				{ key: "level", label: "Nível Mínimo", type: "number", default: 1 },
				{
					key: "playerId",
					label: "Jogador",
					type: "select",
					options: editorStore.avatars,
				},
			],
			execute: (params) =>
				pushCondition("has", { subtype: "skill", ...params }),
		},
		hasCompanion: {
			text: "Companheiro",
			icon: "people",
			params: [
				{
					key: "companionId",
					label: "Companheiro",
					type: "select",
					options: editorStore.companions,
					required: true,
				},
				{
					key: "active",
					label: "Ativo no grupo?",
					type: "boolean",
					default: true,
				},
				{
					key: "playerId",
					label: "Jogador",
					type: "select",
					options: editorStore.avatars,
				},
			],
			execute: (params) =>
				pushCondition("has", { subtype: "companion", ...params }),
		},
		hasRelation: {
			text: "Relação",
			icon: "group",
			params: [
				{
					key: "targetId",
					label: "Alvo da Relação",
					type: "select",
					options: editorStore.objects, // Componente deve filtrar por type: 'npc'
					required: true,
				},
				{ key: "level", label: "Nível de Relação", type: "number", default: 1 },
				{
					key: "comparator",
					label: "Comparador",
					type: "select",
					options: [">=", "<=", "==", ">", "<", "!="],
					default: ">=",
				},
				{
					key: "playerId",
					label: "Jogador",
					type: "select",
					options: editorStore.avatars,
				},
			],
			execute: (params) =>
				pushCondition("has", { subtype: "relation", ...params }),
		},

		// --- Estado do Jogo ---
		hasFlag: {
			text: "Flag",
			icon: "flag",
			params: [
				{
					key: "flagId",
					label: "Flag",
					type: "select",
					options: editorStore.flags,
					required: true,
				},
				{ key: "value", label: "Valor", type: "text", default: true },
				{
					key: "comparator",
					label: "Comparador",
					type: "select",
					options: ["==", "!=", ">=", "<="], // Comparador para o valor
					default: "==",
				},
			],
			execute: (params) => pushCondition("has", { subtype: "flag", ...params }),
		},
		isQuestActive: {
			text: "Missão (Status)",
			icon: "assignment",
			params: [
				{
					key: "questId",
					label: "Missão",
					type: "select",
					options: editorStore.quests,
					required: true,
				},
				{
					key: "status",
					label: "Status",
					type: "select",
					options: ["not_started", "active", "completed", "failed"],
					default: "active",
				},
			],
			execute: (params) =>
				pushCondition("quest", { subtype: "status", ...params }),
		},
		isQuestStepComplete: {
			text: "Missão (Etapa)",
			icon: "rule",
			params: [
				{
					key: "questId",
					label: "Missão",
					type: "select",
					options: editorStore.quests,
					required: true,
				},
				{
					key: "stepKey",
					label: "Etapa (Chave)",
					type: "text",
					required: true,
				},
				{
					key: "completed",
					label: "Completa?",
					type: "boolean",
					default: true,
				},
			],
			execute: (params) =>
				pushCondition("quest", { subtype: "step", ...params }),
		},
		isNodeUnlocked: {
			text: "Nó Destravado",
			icon: "lock_open",
			params: [
				{
					key: "nodeId",
					label: "Nó",
					type: "select",
					options: editorStore.nodes,
					required: true,
				},
				{
					key: "unlocked",
					label: "Destravado?",
					type: "boolean",
					default: true,
				},
			],
			execute: (params) =>
				pushCondition("node", { subtype: "unlocked", ...params }),
		},
		checkObjectState: {
			text: "Estado de Objeto",
			icon: "toggle_on",
			params: [
				{
					key: "objectId",
					label: "Objeto",
					type: "select",
					options: editorStore.objects,
					required: true,
				},
				{
					key: "stateKey",
					label: "Chave do Estado (ex: isOpen)",
					type: "text",
					required: true,
				},
				{ key: "value", label: "Valor Esperado", type: "text", required: true },
			],
			execute: (params) =>
				pushCondition("object", { subtype: "state", ...params }),
		},
	});

	return {
		text: "Condições",
		icon: "https://fonts.gstatic.com/s/e/notoemoji/latest/2705/lottie.json",
		definitions,
	};
});
