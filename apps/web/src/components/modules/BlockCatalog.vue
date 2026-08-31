<script setup lang="ts">
import { computed, ref } from "vue";
import {
  NInput,
  NButton,
  NPopover,
  NIcon,
  NSpace,
  NScrollbar,
  NEmpty,
  NTag,
  NDivider,
  NText,
  NH3,
  NP,
  NCode,
} from "naive-ui";
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

const categoriesList: {
  key: "all" | CategoryKey;
  text: string;
  icon: string;
}[] = [
  { key: "all", text: "Tudo", icon: "grid_view" },
  { key: "variables", text: "Variáveis", icon: "abc" },
  { key: "logics", text: "Lógicas", icon: "alt_route" },
  { key: "functions", text: "Funções", icon: "functions" },
];

const categoryType = {
  variables: "info",
  logics: "success",
  functions: "warning",
} as const;

const getCategoryLabel = (key: string): string => {
  const map: Record<string, string> = {
    variables: "Variável",
    logics: "Controle Lógico",
    functions: "Função / Ação",
  };
  return map[key] || "Bloco";
};

const allBlocks = computed(() => {
  const keys: CategoryKey[] = ["variables", "logics", "functions"];

  const blocks: Array<
    EditorDefinition & {
      key: string;
      categoryKey: CategoryKey;
    }
  > = [];

  for (const key of keys) {
    const config = getCategory(key, editorStore as any);

    if (!config?.definitions) continue;

    for (const [defKey, def] of Object.entries(config.definitions)) {
      blocks.push({
        ...def,
        key: defKey,
        categoryKey: key,
      });
    }
  }

  return blocks;
});

const filteredBlocks = computed(() => {
  let list = allBlocks.value;

  if (selectedCategory.value !== "all") {
    list = list.filter(
      (block) => block.categoryKey === selectedCategory.value
    );
  }

  const query = searchQuery.value.trim().toLowerCase();

  if (query) {
    list = list.filter((block) => {
      return (
        block.text.toLowerCase().includes(query) ||
        block.description?.toLowerCase().includes(query) ||
        block.categoryKey.toLowerCase().includes(query)
      );
    });
  }

  return list;
});

const resultLabel = computed(() => {
  const count = filteredBlocks.value.length;
  return `${count} ${count === 1 ? "bloco" : "blocos"}`;
});

function handleDragStart(
  event: DragEvent,
  blockKey: string,
  definition: EditorDefinition
) {
  if (!event.dataTransfer) return;

  event.dataTransfer.setData(
    "application/vueflow",
    JSON.stringify({
      key: blockKey,
      def: definition,
    })
  );

  event.dataTransfer.effectAllowed = "move";
}

function clearSearch() {
  searchQuery.value = "";
}
</script>

<template>
  <div
    style="
      height: 100%;
      display: flex;
      flex-direction: column;
      user-select: none;
    "
  >
    <!-- Área Fixa (Cabeçalho, Busca e Categorias) -->
    <div style="flex-shrink: 0; padding: 16px 16px 0;">
      <NSpace vertical :size="16">

        <!-- Título e Contador -->
        <NSpace align="center" justify="space-between" :wrap="false">
          <div>
            <NText strong style="display: block;">Biblioteca de blocos</NText>
            <NText depth="3" :style="{ fontSize: '12px' }">
              Arraste ou clique para adicionar
            </NText>
          </div>

          <NTag size="small" :bordered="false" round>
            {{ resultLabel }}
          </NTag>
        </NSpace>

        <!-- Campo de Busca -->
        <NInput
          v-model:value="searchQuery"
          placeholder="Buscar blocos..."
          clearable
        >
          <template #prefix>
            <NIcon :component="Search" />
          </template>
        </NInput>

        <!-- Filtros de Categoria usando NScrollbar nativo para evitar quebra -->
        <NScrollbar x-scrollable>
          <NSpace :size="8" :wrap="false" style="padding-bottom: 8px;">
            <NButton
              v-for="category in categoriesList"
              :key="category.key"
              size="small"
              :type="selectedCategory === category.key ? 'primary' : 'default'"
              :secondary="selectedCategory === category.key"
              round
              @click="selectedCategory = category.key"
            >
              <template #icon>
                <NIcon :component="getIconComponent(category.icon)" />
              </template>
              {{ category.text }}
            </NButton>
          </NSpace>
        </NScrollbar>
      </NSpace>
    </div>

    <NDivider style="margin: 8px 0 0 0;" />

    <!-- Área de Conteúdo Rolável -->
    <NScrollbar style="flex: 1;">
      <div style="padding: 16px;">

        <!-- Estado Vazio -->
        <div
          v-if="filteredBlocks.length === 0"
          style="
            min-height: 240px;
            display: flex;
            align-items: center;
            justify-content: center;
          "
        >
          <NEmpty description="Nenhum bloco encontrado">
            <template #icon>
              <NIcon size="40" :component="getIconComponent('search_off')" />
            </template>
            <template #extra>
              <NButton
                v-if="searchQuery"
                size="small"
                quaternary
                @click="clearSearch"
              >
                Limpar busca
              </NButton>
            </template>
          </NEmpty>
        </div>

        <!-- Grid de Blocos usando NButton nativo -->
        <div
          v-else
          style="
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          "
        >
          <NPopover
            v-for="block in filteredBlocks"
            :key="block.key"
            trigger="hover"
            placement="right"
            :show-delay="350"
            :hide-delay="100"
          >
            <template #trigger>
              <NButton
                :type="categoryType[block.categoryKey]"
                secondary
                block
                draggable="true"
                style="height: auto; padding: 16px 8px;"
                @dragstart="handleDragStart($event, block.key, block)"
                @click="emit('add-item', block)"
              >
                <NSpace vertical align="center" :size="8">
                  <NIcon size="24">
                    <component :is="getIconComponent(block.icon)" />
                  </NIcon>

                  <NText
                    strong
                    :style="{
                      fontSize: '12px',
                      whiteSpace: 'normal',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }"
                  >
                    {{ block.text }}
                  </NText>
                </NSpace>
              </NButton>
            </template>

            <!-- Documentação no Popover respeitando tipografia padrão -->
            <NSpace vertical :size="12" style="width: 280px;">

              <NSpace align="center" justify="space-between" :wrap="false">
                <NTag
                  :type="categoryType[block.categoryKey]"
                  size="small"
                  round
                >
                  {{ getCategoryLabel(block.categoryKey) }}
                </NTag>

                <NText depth="3" :style="{ fontSize: '11px' }">
                  {{ block.params?.length ? `${block.params.length} parâmetros` : "Sem parâmetros" }}
                </NText>
              </NSpace>

              <div>
                <NH3 style="margin: 0 0 4px 0;">
                  {{ block.text }}
                </NH3>
                <NP depth="2" style="margin: 0; font-size: 13px;">
                  {{ block.description || "Adicione este bloco ao seu fluxo de código." }}
                </NP>
              </div>

              <NDivider style="margin: 0;" />

              <div>
                <NText depth="3" strong :style="{ fontSize: '11px', display: 'block', marginBottom: '8px' }">
                  EQUIVALENTE JAVASCRIPT
                </NText>
                <NCode
                  :code="block.preview || '// Código padrão'"
                  language="javascript"
                  word-wrap
                  :style="{ fontSize: '11px' }"
                />
              </div>

              <NText depth="3" :style="{ fontSize: '11px', textAlign: 'center', display: 'block' }">
                Clique para adicionar · Arraste para posicionar
              </NText>
            </NSpace>
          </NPopover>
        </div>
      </div>
    </NScrollbar>
  </div>
</template>
