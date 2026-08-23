<script setup lang="ts">
import { computed, ref } from "vue";
import { NInput, NButton, NPopover, NIcon } from "naive-ui";
import { Search } from "@vicons/ionicons5";
import { useEditorStore } from "@/stores/editor";
import {
	type CategoryKey,
	getCategory,
	type EditorDefinition,
} from "@projeto/types";
import { getIconComponent } from "@/utils/icons";

const emit = defineEmits<{
	"add-item": [EditorDefinition];
}>();

const editorStore = useEditorStore();

const searchQuery = ref("");
const selectedCategory = ref<"all" | CategoryKey>("all");

// Categorias disponíveis
const categoriesList: { key: "all" | CategoryKey; text: string; icon: string }[] = [
	{ key: "all", text: "Tudo", icon: "grid_view" },
	{ key: "variables", text: "Variáveis", icon: "abc" },
	{ key: "logics", text: "Lógicas", icon: "alt_route" },
	{ key: "functions", text: "Funções", icon: "functions" },
];

// Metadados estéticos por categoria
const categoryMeta = {
	variables: {
		label: "Variável",
		borderClass: "border-cyan-500/20 dark:border-cyan-500/10 hover:border-cyan-500/50 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]",
		textClass: "text-cyan-600 dark:text-cyan-400",
		iconBgClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
		glowDotClass: "bg-cyan-500",
	},
	logics: {
		label: "Controle Lógico",
		borderClass: "border-violet-500/20 dark:border-violet-500/10 hover:border-violet-500/50 hover:shadow-[0_0_12px_rgba(139,92,246,0.15)]",
		textClass: "text-violet-600 dark:text-violet-400",
		iconBgClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
		glowDotClass: "bg-violet-500",
	},
	functions: {
		label: "Função / Ação",
		borderClass: "border-amber-500/20 dark:border-amber-500/10 hover:border-amber-500/50 hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]",
		textClass: "text-amber-600 dark:text-amber-400",
		iconBgClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
		glowDotClass: "bg-amber-500",
	},
};



// Constrói a lista plana de todas as definições mapeadas com metadados adicionais
const allBlocks = computed(() => {
	const keys: CategoryKey[] = ["variables", "logics", "functions"];
	const blocks: Array<EditorDefinition & { key: string; categoryKey: CategoryKey }> = [];

	for (const key of keys) {
		const config = getCategory(key, editorStore as any);
		if (config && config.definitions) {
			for (const [defKey, def] of Object.entries(config.definitions)) {
				blocks.push({
					...def,
					key: defKey,
					categoryKey: key,
				});
			}
		}
	}
	return blocks;
});

// Filtra a lista com base na categoria selecionada e no termo de pesquisa
const filteredBlocks = computed(() => {
	let list = allBlocks.value;

	if (selectedCategory.value !== "all") {
		list = list.filter((b) => b.categoryKey === selectedCategory.value);
	}

	if (searchQuery.value.trim()) {
		const query = searchQuery.value.toLowerCase().trim();
		list = list.filter(
			(b) =>
				b.text.toLowerCase().includes(query) ||
				(b.description && b.description.toLowerCase().includes(query)) ||
				b.categoryKey.toLowerCase().includes(query)
		);
	}

	return list;
});

// Manipulador do evento dragstart do HTML5 para transferência ao Vue Flow
function handleDragStart(event: DragEvent, blockKey: string, definition: EditorDefinition) {
	if (!event.dataTransfer) return;
	// Anexa a assinatura da transferência no objeto dataTransfer
	event.dataTransfer.setData(
		"application/vueflow",
		JSON.stringify({
			key: blockKey,
			def: definition,
		})
	);
	event.dataTransfer.effectAllowed = "move";
}
</script>

<template>
	<div class="flex flex-col h-full w-full overflow-hidden select-none bg-[color:var(--n-card-color)] text-[color:var(--n-text-color)]">
		<!-- Header / Busca -->
		<div class="p-4 pb-2 flex flex-col gap-3 shrink-0">
			<div class="flex items-center justify-between">
				<span class="text-base font-bold tracking-tight text-[color:var(--n-text-color)]">
					Biblioteca de Blocos
				</span>
			</div>
			
			<NInput
				v-model:value="searchQuery"
				placeholder="Buscar blocos..."
				clearable
				size="medium"
				class="w-full"
			>
				<template #prefix>
					<NIcon :component="Search" class="opacity-60 mr-1" />
				</template>
			</NInput>
		</div>

		<!-- Categorias horizontais -->
		<div class="px-4 pb-3 pt-1 shrink-0 overflow-x-auto flex gap-2 scrollbar-none">
			<NButton
				v-for="cat in categoriesList"
				:key="cat.key"
				:type="selectedCategory === cat.key ? 'primary' : 'default'"
				:secondary="selectedCategory === cat.key"
				size="small"
				round
				class="shrink-0 font-medium"
				@click="selectedCategory = cat.key"
			>
				<template #icon v-if="cat.icon !== 'grid_view'">
					<NIcon>
						<component :is="getIconComponent(cat.icon)" />
					</NIcon>
				</template>
				{{ cat.text }}
			</NButton>
		</div>

		<!-- Grid dos Blocos Grandes -->
		<div class="flex-1 overflow-y-auto px-4 pb-6 pt-1">
			<div v-if="filteredBlocks.length === 0" class="flex flex-col items-center justify-center py-12 text-center opacity-55">
				<NIcon size="40" class="opacity-40 mb-2">
					<component :is="getIconComponent('search_off')" />
				</NIcon>
				<span class="text-xs font-semibold">Nenhum bloco encontrado</span>
			</div>

			<div v-else class="grid grid-cols-2 gap-3">
				<NPopover
					v-for="block in filteredBlocks"
					:key="block.key"
					trigger="hover"
					placement="right"
					:show-delay="300"
					:hide-delay="100"
					raw
					:show-arrow="true"
				>
					<template #trigger>
						<!-- Bloco Card Grande -->
						<div
							draggable="true"
							@dragstart="handleDragStart($event, block.key, block)"
							@click="emit('add-item', block)"
							class="group flex flex-col items-center justify-center p-3.5 h-[105px] rounded-2xl border bg-[color:var(--n-card-color)] cursor-grab active:cursor-grabbing hover:-translate-y-[2px] active:scale-[0.97] transition-all duration-300 relative overflow-hidden"
							:class="[
								categoryMeta[block.categoryKey].borderClass,
								'hover:bg-neutral-50 dark:hover:bg-neutral-900/30'
							]"
						>
							<!-- Detalhe sutil da cor no topo -->
							<div 
								class="absolute top-0 left-0 w-full h-[3px] opacity-70"
								:class="categoryMeta[block.categoryKey].glowDotClass"
							/>
							
							<!-- Círculo do Ícone -->
							<div
								class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
								:class="categoryMeta[block.categoryKey].iconBgClass"
							>
								<NIcon size="20">
									<component :is="getIconComponent(block.icon)" />
								</NIcon>
							</div>
							
							<!-- Título -->
							<span class="text-[11px] font-bold text-center mt-2.5 line-clamp-1 w-full text-[color:var(--n-text-color)] opacity-85 group-hover:opacity-100 transition-opacity">
								{{ block.text }}
							</span>
						</div>
					</template>

					<!-- Conteúdo Popover Premium -->
					<div class="w-[280px] p-4 bg-[#18181c] border border-neutral-800 rounded-2xl shadow-xl flex flex-col gap-2.5 text-neutral-200 select-text">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="w-2 h-2 rounded-full" :class="categoryMeta[block.categoryKey].glowDotClass" />
								<span class="text-[10px] font-black uppercase tracking-wider text-neutral-400">
									{{ categoryMeta[block.categoryKey].label }}
								</span>
							</div>
							<span class="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 font-medium">
								{{ block.params && block.params.length ? `${block.params.length} params` : 'sem params' }}
							</span>
						</div>

						<h4 class="text-sm font-extrabold m-0 text-white" :class="categoryMeta[block.categoryKey].textClass">
							{{ block.text }}
						</h4>

						<p class="text-xs text-neutral-400 leading-relaxed m-0 font-medium">
							{{ block.description || 'Adicione este bloco ao seu fluxo de código.' }}
						</p>

						<div class="mt-1 pt-3 border-t border-neutral-800 flex flex-col gap-1.5">
							<span class="text-[9px] uppercase tracking-wider text-neutral-500 font-bold">Equivalente JavaScript:</span>
							<pre class="m-0 bg-neutral-950 text-cyan-300 text-[10px] p-2.5 rounded-xl font-mono border border-neutral-900 overflow-x-auto select-all max-h-[80px] scrollbar-thin">{{ block.preview || '// Código padrão' }}</pre>
						</div>
					</div>
				</NPopover>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* Remove scrollbar */
.scrollbar-none::-webkit-scrollbar {
	display: none;
}
.scrollbar-none {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
</style>
