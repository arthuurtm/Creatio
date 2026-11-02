<script setup lang="ts">
import {
  ChevronBack,
  ChevronForward,
  SearchOutline,
  GitBranchOutline,
  SyncOutline,
  CubeOutline,
  CodeSlashOutline,
  AlertCircleOutline,
  HardwareChipOutline,
  FolderOutline,
  FlashOutline,
  AddOutline,
  GridOutline,
} from "@vicons/ionicons5";
import {
  NButton,
  NIcon,
  NInput,
  NScrollbar,
  NCollapse,
  NCollapseItem,
  NDivider,
  NEmpty,
  NTag,
  NText,
} from "naive-ui";
import { computed, ref, onMounted } from "vue";
import { useEditor } from "@/composables/useEditor";
import type { LanguageSnippet } from "@projeto/types";
import ExplorerRail from "./ExplorerRail.vue";
import StructureTree from "./StructureTree.vue";

type DrawerState = "open" | "rail" | "hidden";

const props = defineProps<{ state?: DrawerState }>();
const emit = defineEmits<{ "update:state": [value: DrawerState] }>();

const editor = useEditor();
const internalState = ref<DrawerState>("open");
const activeView = ref<"explorer" | "catalog">("explorer");

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
  e.dataTransfer.setData("text/plain", getSnippetCode(snippet));
  e.dataTransfer.effectAllowed = "move";
}

async function insertDirectly(snippet: LanguageSnippet) {
  const code = getSnippetCode(snippet);
  if (code) {
    await editor.insertSnippet(code);
  }
}

/** Mapa de categorias de snippet para accent color (CSS token) e ícone */
const SNIPPET_CATEGORIES = [
  {
    keys: ["if", "else", "switch", "case", "decisão", "senão", "escolha"],
    cssVar: "--color-snippet-flow",
    color: "#8b5cf6",
    icon: GitBranchOutline,
    desc: "Controle de fluxo",
  },
  {
    keys: ["for", "while", "loop", "repetição", "repetir", "faça", "laço", "item da lista"],
    cssVar: "--color-snippet-flow",
    color: "#8b5cf6",
    icon: SyncOutline,
    desc: "Laço de repetição",
  },
  {
    keys: ["const", "let", "var", "vari", "guardar", "constante", "número", "texto", "verdadeiro"],
    cssVar: "--color-snippet-data",
    color: "#06b6d4",
    icon: CubeOutline,
    desc: "Memória / Variável",
  },
  {
    keys: ["function", "return", "função", "criar uma função", "parâmetro", "chamar"],
    cssVar: "--color-snippet-fn",
    color: "#f59e0b",
    icon: CodeSlashOutline,
    desc: "Bloco de execução",
  },
  {
    keys: ["try", "catch", "throw", "erro", "capturar", "tentar"],
    cssVar: "--color-snippet-error",
    color: "#ef4444",
    icon: AlertCircleOutline,
    desc: "Tratamento de erro",
  },
  {
    keys: ["import", "export", "módulo"],
    cssVar: "--color-snippet-module",
    color: "#3b82f6",
    icon: HardwareChipOutline,
    desc: "Módulo",
  },
  {
    keys: ["lista", "array", "adicionar", "tamanho", "índice", "item"],
    cssVar: "--color-snippet-array",
    color: "#14b8a6",
    icon: FolderOutline,
    desc: "Lista / Array",
  },
] as const;

const DEFAULT_SNIPPET = {
  cssVar: "--color-snippet-default",
  color: "#3b82f6",
  icon: FlashOutline,
  desc: "Comando de sintaxe",
};

function getSnippetStyle(label: string) {
  const l = label.toLowerCase();
  for (const cat of SNIPPET_CATEGORIES) {
    if (cat.keys.some((k) => l.includes(k))) {
      return { color: cat.color, icon: cat.icon, desc: cat.desc };
    }
  }
  return { color: DEFAULT_SNIPPET.color, icon: DEFAULT_SNIPPET.icon, desc: DEFAULT_SNIPPET.desc };
}
</script>

<template>
  <aside
    class="explorer h-full shrink-0"
    :class="{
      'is-open': !isRail && !isHidden,
      'is-rail': isRail && !isHidden,
      'is-hidden': isHidden,
    }"
  >
    <!-- Modo recolhido -->
    <ExplorerRail
      v-if="isRail"
      :active-view="activeView"
      @expand="drawerState = 'open'"
      @select-view="(view) => { activeView = view; drawerState = 'open'; }"
    />

    <!-- Modo expandido -->
    <div v-show="!isRail && !isHidden" class="explorer-body h-full flex flex-col">
      <header class="explorer-header flex flex-col gap-2.5 p-3.5">
        <div class="flex items-center justify-between">
          <div class="view-switcher flex items-center gap-1">
            <NButton
              size="small"
              :type="activeView === 'explorer' ? 'primary' : 'default'"
              :secondary="activeView !== 'explorer'"
              @click="activeView = 'explorer'"
            >
              <template #icon>
                <NIcon :component="GridOutline" />
              </template>
              Estruturas
            </NButton>

            <NButton
              size="small"
              :type="activeView === 'catalog' ? 'primary' : 'default'"
              :secondary="activeView !== 'catalog'"
              @click="activeView = 'catalog'"
            >
              <template #icon>
                <NIcon :component="HardwareChipOutline" />
              </template>
              Catálogo
            </NButton>
          </div>

          <NButton circle quaternary size="small" title="Recolher painel" @click="toggleState">
            <template #icon>
              <NIcon size="18"><ChevronBack /></NIcon>
            </template>
          </NButton>
        </div>

        <NInput
          v-if="activeView === 'catalog'"
          v-model:value="search"
          placeholder="Buscar comandos (ex: if, for, let)"
          clearable
          size="small"
        >
          <template #prefix>
            <NIcon :component="SearchOutline" depth="3" />
          </template>
        </NInput>
      </header>

      <!-- Visualização da Árvore de Estrutura -->
      <StructureTree v-if="activeView === 'explorer'" class="flex-1 min-h-0" />

      <!-- Visualização do Catálogo de Blocos -->
      <NScrollbar v-else-if="activeView === 'catalog'" class="flex-1 min-h-0">
        <div class="p-3 flex flex-col gap-2">
          <NEmpty
            v-if="filteredSnippets.length === 0"
            description="Nenhum bloco encontrado com essa busca"
            class="empty"
          />

          <template v-else v-for="snippet in filteredSnippets" :key="snippet.label">
            <!-- Grupo com sub-itens -->
            <NCollapse
              v-if="'subitems' in snippet && snippet.subitems"
              arrow-placement="right"
              class="group"
              :class="{ 'is-advanced': (snippet as any).advanced }"
              :default-expanded-names="(snippet as any).advanced ? [] : [snippet.label]"
            >
              <NCollapseItem :name="snippet.label">
                <template #header>
                  <div class="flex items-center gap-2 w-full">
                    <NIcon size="16" depth="3"><FolderOutline /></NIcon>
                    <NText strong class="group-title">{{ snippet.label }}</NText>
                    <NTag size="tiny" round :bordered="false" type="primary" class="ml-2 font-mono">
                      {{ snippet.subitems.length }}
                    </NTag>
                  </div>
                </template>

                <div class="flex flex-col">
                  <template v-for="(sub, index) in snippet.subitems" :key="sub.label">
                    <div
                      class="snippet flex items-center gap-3"
                      :style="{ '--accent': getSnippetStyle(sub.label).color }"
                      draggable="true"
                      @dragstart="onDragStart($event, sub)"
                      @click="insertDirectly(sub)"
                    >
                      <span class="snippet-icon flex items-center justify-center shrink-0">
                        <NIcon size="18" :component="getSnippetStyle(sub.label).icon" />
                      </span>
                      <div class="flex flex-col min-w-0 flex-1">
                        <NText strong class="snippet-label">{{ sub.label }}</NText>
                        <NText depth="3" class="snippet-desc">{{ getSnippetStyle(sub.label).desc }}</NText>
                      </div>
                      <NIcon size="16" depth="3" class="snippet-action shrink-0"><ChevronForward /></NIcon>
                    </div>
                    <NDivider v-if="index < snippet.subitems.length - 1" class="divider-item" />
                  </template>
                </div>
              </NCollapseItem>
            </NCollapse>

            <!-- Bloco único -->
            <div
              v-else
              class="snippet snippet--single flex items-center gap-3"
              :style="{ '--accent': getSnippetStyle(snippet.label).color }"
              draggable="true"
              @dragstart="onDragStart($event, snippet)"
              @click="insertDirectly(snippet)"
            >
              <span class="snippet-icon flex items-center justify-center shrink-0">
                <NIcon size="18" :component="getSnippetStyle(snippet.label).icon" />
              </span>
              <div class="flex flex-col min-w-0 flex-1">
                <NText strong class="snippet-label">{{ snippet.label }}</NText>
                <NText depth="3" class="snippet-desc">{{ getSnippetStyle(snippet.label).desc }}</NText>
              </div>
              <NIcon size="16" depth="3" class="snippet-action shrink-0"><AddOutline /></NIcon>
            </div>
          </template>
        </div>
      </NScrollbar>
    </div>
  </aside>
</template>

<style scoped>
.text-primary {
  color: var(--color-primary);
}

.explorer {
  position: relative;
  background: var(--color-bg);
  border-right: 1px solid var(--color-border);
  overflow: hidden;
  transition: width var(--transition-layout), opacity var(--transition-layout);
}

.explorer.is-open  { width: 340px; }
.explorer.is-rail  { width: 56px; }
.explorer.is-hidden {
  width: 0;
  opacity: 0;
  border-right: none;
  pointer-events: none;
}

.explorer-body  { min-width: 340px; }
.explorer-header { border-bottom: 1px solid var(--color-border); }
.title { font-size: 14px; letter-spacing: 0.01em; }

/* ── Cartões de bloco ────────────────────────────────────────────────────── */
.snippet {
  padding: var(--space-2) var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: grab;
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.snippet:active { cursor: grabbing; }

.snippet:hover {
  border-color: var(--accent);
  background: var(--color-hover);
  box-shadow: var(--shadow-1);
}

.snippet-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
}

.snippet-label,
.snippet-desc {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.snippet-label { font-size: 13px; line-height: 1.3; }
.snippet-desc  { font-size: 11px; line-height: 1.3; }

.snippet-action {
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.snippet:hover .snippet-action {
  opacity: 1;
  transform: translateX(0);
}

/* ── Grupos ──────────────────────────────────────────────────────────────── */
.group {
  border: 1px solid var(--color-border);
  border-radius: calc(var(--radius-md) + 2px);
  background: var(--color-surface-action);
  overflow: hidden;
}
.group.is-advanced { opacity: 0.75; }
.group-title { font-size: 13px; }

.group :deep(.n-collapse-item__header)      { padding: 10px 14px !important; }
.group :deep(.n-collapse-item__content-inner){ padding: 0 !important; }
.group :deep(.n-collapse-item)               { margin: 0 !important; }

.divider-item { margin: 0 !important; }

.group .snippet {
  background: var(--color-surface);
  border: none;
  border-radius: 0;
  padding: var(--space-3) 14px;
}

.empty { padding: var(--space-12) 0; }
</style>
