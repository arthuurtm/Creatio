<script setup lang="ts">
import {
  ChevronBack,
  SearchOutline,
  GitBranchOutline,
  SyncOutline,
  CubeOutline,
  CodeSlashOutline,
  AlertCircleOutline,
  HardwareChipOutline,
  FolderOutline,
  FlashOutline
} from "@vicons/ionicons5";
import {
  NButton,
  NIcon,
  NInput,
  NScrollbar,
  NCollapse,
  NCollapseItem,
  NEmpty,
  NCard,
  NTag,
  NText,
  NFlex,
} from "naive-ui";
import { computed, ref, onMounted } from "vue";
import { useEditor } from "@/composables/useEditor";
import type { LanguageSnippet } from "@projeto/types";
import ExplorerRail from "./ExplorerRail.vue";

type DrawerState = "open" | "rail" | "hidden";

const props = defineProps<{ state?: DrawerState }>();
const emit = defineEmits<{ "update:state": [value: DrawerState] }>();

const editor = useEditor();
const internalState = ref<DrawerState>("open");

const drawerState = computed({
  get: () => props.state ?? internalState.value,
  set: (value: DrawerState) => {
    internalState.value = value;
    emit("update:state", value);
  },
});
const isRail = computed(() => drawerState.value === "rail");
const isHidden = computed(() => drawerState.value === "hidden");

const search = ref("");

function toggleState() {
  drawerState.value = isRail.value ? "open" : "rail";
}

onMounted(async () => {
  if (editor.snippets.value.length === 0) {
    await editor.loadSnippets();
  }
});

const filteredSnippets = computed(() => {
  const query = search.value.toLowerCase().trim();
  if (!query) return editor.snippets.value;

  function filterItem(item: LanguageSnippet): LanguageSnippet | null {
    if ("subitems" in item && item.subitems) {
      const matchingSubs = item.subitems.filter((sub) =>
        sub.label.toLowerCase().includes(query)
      );
      if (matchingSubs.length > 0) {
        return { ...item, subitems: matchingSubs };
      }
    }
    if (item.label.toLowerCase().includes(query)) {
      return item;
    }
    return null;
  }

  return editor.snippets.value
    .map(filterItem)
    .filter((i): i is LanguageSnippet => i !== null);
});

function getSnippetCode(snippet: LanguageSnippet): string {
  if ("code" in snippet) {
    return typeof snippet.code === "function" ? snippet.code() : snippet.code;
  }
  return "";
}

function onDragStart(e: DragEvent, snippet: LanguageSnippet) {
  if (!e.dataTransfer) return;
  const code = getSnippetCode(snippet);
  e.dataTransfer.setData("text/plain", code);
  e.dataTransfer.effectAllowed = "move";
}

async function insertDirectly(snippet: LanguageSnippet) {
  const code = getSnippetCode(snippet);
  if (code) {
    await editor.insertSnippet(code);
  }
}

function getSnippetStyle(label: string) {
  const l = label.toLowerCase();
  
  if (l.includes('if') || l.includes('else') || l.includes('switch') || l.includes('case')) {
    return { type: 'warning', icon: GitBranchOutline, desc: 'Controle de fluxo' };
  }
  if (l.includes('for') || l.includes('while') || l.includes('loop')) {
    return { type: 'primary', icon: SyncOutline, desc: 'Laço de repetição' };
  }
  if (l.includes('const') || l.includes('let') || l.includes('var') || l.includes('vari')) {
    return { type: 'info', icon: CubeOutline, desc: 'Memória / Variável' };
  }
  if (l.includes('function') || l.includes('return') || l.includes('função')) {
    return { type: 'success', icon: CodeSlashOutline, desc: 'Bloco de execução' };
  }
  if (l.includes('try') || l.includes('catch') || l.includes('throw')) {
    return { type: 'error', icon: AlertCircleOutline, desc: 'Tratamento de erro' };
  }
  if (l.includes('import') || l.includes('export')) {
    return { type: 'primary', icon: HardwareChipOutline, desc: 'Módulo' };
  }
  
  return { type: 'primary', icon: FlashOutline, desc: 'Comando de sintaxe' };
}
</script>

<template>
  <aside
    class="h-full shrink-0 relative transition-all duration-300 ease-in-out border-r border-[var(--border-color)] bg-[var(--n-color)]"
    :class="{
      'w-[340px]': !isRail && !isHidden,
      'w-[56px]': isRail && !isHidden,
      'w-0 opacity-0 pointer-events-none border-none': isHidden,
    }"
  >
    <!-- MODO RECOLHIDO (Rail) -->
    <ExplorerRail
      v-if="isRail"
      active-view="catalog"
      @expand="drawerState = 'open'"
      @select-view="drawerState = 'open'"
    />

    <!-- MODO EXPANDIDO -->
    <div v-show="!isRail && !isHidden" class="h-full flex flex-col min-w-[340px]">
      <!-- Header -->
      <div class="p-4 border-b border-[var(--border-color)]">
        <NFlex justify="space-between" align="center" class="mb-4">
          <div class="flex items-center gap-2">
            <NIcon size="20" class="text-[color:var(--n-primary-color)]"><HardwareChipOutline /></NIcon>
            <NText strong class="text-[15px]">Catálogo de Blocos</NText>
          </div>
          <NButton circle quaternary size="small" title="Recolher" @click="toggleState">
            <template #icon>
              <NIcon size="18"><ChevronBack /></NIcon>
            </template>
          </NButton>
        </NFlex>

        <NInput
          v-model:value="search"
          placeholder="Buscar comandos (ex: if, for, let)"
          clearable
          round
        >
          <template #prefix>
            <NIcon :component="SearchOutline" class="opacity-60" />
          </template>
        </NInput>
      </div>

      <!-- Lista estilizada -->
      <NScrollbar class="flex-grow p-4">
        <div v-if="filteredSnippets.length === 0" class="py-12 text-center">
          <NEmpty description="Nenhum bloco encontrado com essa busca" />
        </div>

        <NFlex vertical :size="12" v-else>
          <template v-for="snippet in filteredSnippets" :key="snippet.label">
            
            <!-- Grupo com sub-itens -->
            <NCollapse
              v-if="'subitems' in snippet && snippet.subitems"
              arrow-placement="right"
              class="snippet-group-collapse border border-[color:var(--n-border-color)] rounded-2xl bg-[color:var(--n-action-color)] overflow-hidden"
            >
              <NCollapseItem :name="snippet.label">
                <template #header>
                  <div class="flex items-center gap-2 py-1">
                    <NIcon size="16" class="opacity-70"><FolderOutline /></NIcon>
                    <NText strong class="text-[13px]">{{ snippet.label }}</NText>
                    <NTag size="small" round :bordered="false" class="ml-2 font-mono text-[10px] opacity-70">
                      {{ snippet.subitems.length }}
                    </NTag>
                  </div>
                </template>
                <div class="flex flex-col gap-2 p-2 pt-0">
                  <NCard
                    v-for="sub in snippet.subitems"
                    :key="sub.label"
                    hoverable
                    embedded
                    draggable="true"
                    @dragstart="onDragStart($event, sub)"
                    @click="insertDirectly(sub)"
                    class="cursor-grab active:cursor-grabbing rounded-xl transition-all hover:border-[color:var(--n-primary-color)] snippet-card"
                    content-style="padding: 10px 12px;"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-[color:var(--n-tag-color)] shrink-0">
                        <NIcon size="18" :component="getSnippetStyle(sub.label).icon" :style="`color: var(--n-${getSnippetStyle(sub.label).type}-color)`" />
                      </div>
                      <div class="flex flex-col min-w-0 flex-1">
                        <NText strong class="text-xs truncate">{{ sub.label }}</NText>
                        <NText class="text-[10px] opacity-60 truncate">{{ getSnippetStyle(sub.label).desc }}</NText>
                      </div>
                      <NIcon size="16" class="opacity-30 shrink-0"><ChevronBack class="rotate-180" /></NIcon>
                    </div>
                  </NCard>
                </div>
              </NCollapseItem>
            </NCollapse>

            <!-- Bloco único -->
            <NCard
              v-else
              hoverable
              draggable="true"
              @dragstart="onDragStart($event, snippet)"
              @click="insertDirectly(snippet)"
              class="cursor-grab active:cursor-grabbing rounded-2xl transition-all hover:border-[color:var(--n-primary-color)] snippet-card border border-[color:var(--n-border-color)]"
              content-style="padding: 12px 14px;"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center bg-[color:var(--n-tag-color)] shrink-0 border border-[color:var(--n-border-color)]">
                  <NIcon size="20" :component="getSnippetStyle(snippet.label).icon" :style="`color: var(--n-${getSnippetStyle(snippet.label).type}-color)`" />
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                  <NText strong class="text-[13px] truncate">{{ snippet.label }}</NText>
                  <NText class="text-[11px] opacity-60 truncate">{{ getSnippetStyle(snippet.label).desc }}</NText>
                </div>
                <NTag size="small" :bordered="false" round type="primary" class="shrink-0 text-[10px]">
                  adicionar
                </NTag>
              </div>
            </NCard>

          </template>
        </NFlex>
      </NScrollbar>
    </div>
  </aside>
</template>

<style scoped>
.snippet-group-collapse :deep(.n-collapse-item__header) {
  padding: 12px 16px !important;
}
.snippet-group-collapse :deep(.n-collapse-item__content-inner) {
  padding: 0 !important;
}

.snippet-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>
