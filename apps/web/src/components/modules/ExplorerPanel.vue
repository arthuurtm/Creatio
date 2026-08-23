<script setup lang="ts">
import { ref, computed } from "vue";
import { NInput, NButton, NIcon, NCollapse, NCollapseItem } from "naive-ui";
import { Search } from "@vicons/ionicons5";
import { UnfoldLessOutlined, UnfoldMoreOutlined } from "@vicons/material";
import { useEditorStore } from "@/stores/editor";
import { getCategory, type EditorDefinition } from "@projeto/types";
import ComponentQuickEditPanel from "@/components/modules/ComponentQuickEditPanel.vue";
import CreateNodeMenu from "./CreateNodeMenu.vue";
import { getIconComponent } from "@/utils/icons";

const emit = defineEmits<{
  "add-item": [EditorDefinition];
}>();

const editorStore = useEditorStore();

const searchQuery = ref("");
const expandedNames = ref<string[]>(["variables", "logics", "functions"]);

// Configurações e definições das categorias
const variablesConfig = computed(() => getCategory('variables', editorStore as any));
const logicsConfig = computed(() => getCategory('logics', editorStore as any));
const functionsConfig = computed(() => getCategory('functions', editorStore as any));

const variablesDefinitions = computed(() => variablesConfig.value?.definitions ?? {});
const logicsDefinitions = computed(() => logicsConfig.value?.definitions ?? {});
const functionsDefinitions = computed(() => functionsConfig.value?.definitions ?? {});

// Computed listas com getter/setter reativos para sincronização direta com a store
const variablesList = computed({
  get: () => {
    const list = editorStore.nodes.filter(n => n.type === 'variables');
    if (!searchQuery.value.trim()) return list;
    const query = searchQuery.value.toLowerCase().trim();
    return list.filter(n => {
      const name = n.data?.params?.name || n.data?.params?.varId || "";
      return name.toLowerCase().includes(query) || n.id.toLowerCase().includes(query);
    });
  },
  set: (newVal) => {
    const otherNodes = editorStore.nodes.filter(n => n.type !== 'variables');
    editorStore.setState({ nodes: [...otherNodes, ...newVal] });
  }
});

const logicsList = computed({
  get: () => {
    const list = editorStore.nodes.filter(n => n.type === 'logics');
    if (!searchQuery.value.trim()) return list;
    const query = searchQuery.value.toLowerCase().trim();
    return list.filter(n => {
      const cat = n.data?.category || "";
      const cond = n.data?.params?.condition || "";
      return cat.toLowerCase().includes(query) || cond.toLowerCase().includes(query) || n.id.toLowerCase().includes(query);
    });
  },
  set: (newVal) => {
    const otherNodes = editorStore.nodes.filter(n => n.type !== 'logics');
    editorStore.setState({ nodes: [...otherNodes, ...newVal] });
  }
});

const functionsList = computed({
  get: () => {
    const list = editorStore.nodes.filter(n => n.type === 'functions');
    if (!searchQuery.value.trim()) return list;
    const query = searchQuery.value.toLowerCase().trim();
    return list.filter(n => {
      const name = n.data?.params?.name || n.data?.params?.funcName || "";
      return name.toLowerCase().includes(query) || n.id.toLowerCase().includes(query);
    });
  },
  set: (newVal) => {
    const otherNodes = editorStore.nodes.filter(n => n.type !== 'functions');
    editorStore.setState({ nodes: [...otherNodes, ...newVal] });
  }
});

const allExpanded = computed(() => expandedNames.value.length === 3);

function toggleAllExpanded() {
  if (allExpanded.value) {
    expandedNames.value = [];
  } else {
    expandedNames.value = ["variables", "logics", "functions"];
  }
}
</script>

<template>
  <div class="flex flex-col h-full w-full overflow-hidden select-none bg-[color:var(--n-card-color)] text-[color:var(--n-text-color)]">
    <!-- Barra de busca e controle de expansão -->
    <div class="px-4 py-3 shrink-0 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800/40">
      <NInput
        v-model:value="searchQuery"
        placeholder="Filtrar estruturas..."
        clearable
        size="small"
        class="flex-1"
      >
        <template #prefix>
          <NIcon :component="Search" class="opacity-60 mr-1" />
        </template>
      </NInput>

      <NButton
        circle
        quaternary
        size="small"
        :title="allExpanded ? 'Recolher todas as pastas' : 'Expandir todas as pastas'"
        @click="toggleAllExpanded"
      >
        <template #icon>
          <NIcon size="18">
            <UnfoldLessOutlined v-if="allExpanded" />
            <UnfoldMoreOutlined v-else />
          </NIcon>
        </template>
      </NButton>
    </div>

    <!-- Árvore de estruturas ativas colapsáveis -->
    <div class="flex-grow overflow-y-auto px-4 pb-6 pt-1">
      <NCollapse v-model:expanded-names="expandedNames" arrow-placement="left">
        <!-- Sanfona Variáveis -->
        <NCollapseItem name="variables">
          <template #header>
            <div class="flex items-center justify-between w-full pr-1">
              <div class="flex items-center gap-2">
                <NIcon size="16" class="text-cyan-500">
                  <component :is="getIconComponent(variablesConfig?.icon)" />
                </NIcon>
                <span class="font-bold text-xs uppercase tracking-wider text-[color:var(--n-text-color)]">
                  {{ variablesConfig?.text }}
                </span>
                <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 font-bold">
                  {{ variablesList.length }}
                </span>
              </div>
              <div @click.stop class="pointer-events-auto shrink-0">
                <CreateNodeMenu :definitions="variablesDefinitions" @select="emit('add-item', $event)" />
              </div>
            </div>
          </template>
          <div class="pl-2 pt-1 pb-2">
            <ComponentQuickEditPanel
              v-model:modelValue="variablesList"
              :start-expanded="allExpanded"
              label="Variáveis Ativas"
            />
          </div>
        </NCollapseItem>

        <!-- Sanfona Lógicas -->
        <NCollapseItem name="logics">
          <template #header>
            <div class="flex items-center justify-between w-full pr-1">
              <div class="flex items-center gap-2">
                <NIcon size="16" class="text-violet-500">
                  <component :is="getIconComponent(logicsConfig?.icon)" />
                </NIcon>
                <span class="font-bold text-xs uppercase tracking-wider text-[color:var(--n-text-color)]">
                  {{ logicsConfig?.text }}
                </span>
                <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 font-bold">
                  {{ logicsList.length }}
                </span>
              </div>
              <div @click.stop class="pointer-events-auto shrink-0">
                <CreateNodeMenu :definitions="logicsDefinitions" @select="emit('add-item', $event)" />
              </div>
            </div>
          </template>
          <div class="pl-2 pt-1 pb-2">
            <ComponentQuickEditPanel
              v-model:modelValue="logicsList"
              :start-expanded="allExpanded"
              label="Lógicas Ativas"
            />
          </div>
        </NCollapseItem>

        <!-- Sanfona Funções -->
        <NCollapseItem name="functions">
          <template #header>
            <div class="flex items-center justify-between w-full pr-1">
              <div class="flex items-center gap-2">
                <NIcon size="16" class="text-amber-500">
                  <component :is="getIconComponent(functionsConfig?.icon)" />
                </NIcon>
                <span class="font-bold text-xs uppercase tracking-wider text-[color:var(--n-text-color)]">
                  {{ functionsConfig?.text }}
                </span>
                <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 font-bold">
                  {{ functionsList.length }}
                </span>
              </div>
              <div @click.stop class="pointer-events-auto shrink-0">
                <CreateNodeMenu :definitions="functionsDefinitions" @select="emit('add-item', $event)" />
              </div>
            </div>
          </template>
          <div class="pl-2 pt-1 pb-2">
            <ComponentQuickEditPanel
              v-model:modelValue="functionsList"
              :start-expanded="allExpanded"
              label="Funções Ativas"
            />
          </div>
        </NCollapseItem>
      </NCollapse>
    </div>
  </div>
</template>
