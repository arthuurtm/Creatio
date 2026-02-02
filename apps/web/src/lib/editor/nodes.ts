import { computed } from "vue";
import { createDefinitions } from "@projeto/types";
import { createNode } from "@/composables/useNodeFunctions";

export const nodes = computed(() => {
	const createActionNode = (x: number, y: number, extra = {}) =>
		createNode(x, y, extra);

	const definitions = createDefinitions({
		createDialogBlock: {
			text: "Ação de narrativa",
			icon: "code",
			execute: (e) => createActionNode(e.pageX, e.pageY),
		},
		createConfigBlock: {
			text: "Ação de configuração",
			icon: "settings_applications",
			execute: (e) => createActionNode(e.pageX, e.pageY, { type: "config" }),
		},
	});
	return {
		text: "Linhas do tempo",
		icon: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f52e/lottie.json",
		definitions,
	};
});
