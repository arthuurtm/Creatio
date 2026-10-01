<script setup lang="ts">
import { ChevronBack, SearchOutline } from "@vicons/ionicons5";
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
</script>

<template>
  <aside
    class="h-full shrink-0 relative transition-all duration-300 ease-in-out border-r border-[var(--border-color)] bg-[var(--n-color)]"
    :class="{
      'w-[310px]': !isRail && !isHidden,
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
    <div v-show="!isRail && !isHidden" class="h-full flex flex-col min-w-[310px]">
      <!-- Header com NCard/NFlex do Naive -->
      <div class="p-3 border-b border-[var(--border-color)]">
        <NFlex justify="space-between" align="center" class="mb-2">
          <NText strong class="text-sm">Blocos & Snippets</NText>
          <NButton circle quaternary size="tiny" title="Recolher" @click="toggleState">
            <template #icon>
              <NIcon size="16"><ChevronBack /></NIcon>
            </template>
          </NButton>
        </NFlex>

        <NInput
          v-model:value="search"
          placeholder="Buscar comandos (if, let...)"
          size="small"
          clearable
          round
        >
          <template #prefix>
            <NIcon :component="SearchOutline" />
          </template>
        </NInput>
      </div>

      <!-- Lista estilizada com Naive UI -->
      <NScrollbar class="flex-grow p-3">
        <div v-if="filteredSnippets.length === 0" class="py-12">
          <NEmpty description="Nenhum bloco encontrado" />
        </div>

        <NFlex vertical :size="8" v-else>
          <template v-for="snippet in filteredSnippets" :key="snippet.label">
            <!-- Grupo com sub-itens via NCollapse do Naive -->
            <NCollapse
              v-if="'subitems' in snippet && snippet.subitems"
              arrow-placement="right"
              class="border border-[var(--border-color)] rounded-xl px-3 bg-neutral-500/5"
            >
              <NCollapseItem :title="snippet.label" :name="snippet.label">
                <NFlex vertical :size="6" class="pb-2">
                  <NCard
                    v-for="sub in snippet.subitems"
                    :key="sub.label"
                    size="small"
                    hoverable
                    embedded
                    draggable="true"
                    @dragstart="onDragStart($event, sub)"
                    @click="insertDirectly(sub)"
                    class="cursor-grab active:cursor-grabbing !rounded-lg"
                  >
                    <NFlex justify="space-between" align="center">
                      <NText code class="text-xs">{{ sub.label }}</NText>
                      <NTag size="tiny" :bordered="false" round type="info">arraste</NTag>
                    </NFlex>
                  </NCard>
                </NFlex>
              </NCollapseItem>
            </NCollapse>

            <!-- Bloco único via NCard -->
            <NCard
              v-else
              size="small"
              hoverable
              draggable="true"
              @dragstart="onDragStart($event, snippet)"
              @click="insertDirectly(snippet)"
              class="cursor-grab active:cursor-grabbing !rounded-xl"
            >
              <NFlex justify="space-between" align="center">
                <NText strong class="text-xs">{{ snippet.label }}</NText>
                <NTag size="tiny" :bordered="false" round type="primary">adicionar</NTag>
              </NFlex>
            </NCard>
          </template>
        </NFlex>
      </NScrollbar>
    </div>
  </aside>
</template>
