<script setup lang="ts">
import type { CategoryKey, EditorDefinition, SDKNode } from "@projeto/types";
import ComponentQuickEditPanel from "@/components/modules/ComponentQuickEditPanel.vue";
import CreateNodeMenu from "./CreateNodeMenu.vue";
import { getIconComponent } from "@/utils/icons";
import { ChevronBack, ExtensionPuzzleOutline } from "@vicons/ionicons5";

const props = defineProps<{
  sidebarItems: any[];
  activeCategory: CategoryKey | undefined;
  activeCategoryConfig: any;
  activeDefinitions: Record<string, EditorDefinition>;
  allExpanded: boolean;
  editorStore: any;
  activeNodes: SDKNode[];
}>();

const emit = defineEmits<{
  collapse: [];
  selectCategory: [CategoryKey];
  toggleExpanded: [];
  addItem: [EditorDefinition];
}>();
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100%; width: 100%;">
    <!-- Header -->
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px;">
      <span style="font-size: 16px; font-weight: 700; opacity: 0.7;">
        Explorador
      </span>
      <n-button
        circle
        quaternary
        size="small"
        title="Minimizar"
        @click="emit('collapse')"
      >
        <template #icon>
          <n-icon size="20"><ChevronBack /></n-icon>
        </template>
      </n-button>
    </div>

    <!-- Sidebar categories selector -->
    <div style="padding: 0 16px 12px 16px;">
      <n-space :size="8" wrap>
        <n-button
          v-for="item in sidebarItems"
          :key="item.key"
          :type="activeCategory === item.key ? 'primary' : 'default'"
          :secondary="activeCategory === item.key"
          size="small"
          round
          @click="emit('selectCategory', item.key)"
        >
          <template #icon>
            <n-icon size="16">
              <component :is="getIconComponent(item.icon)" />
            </n-icon>
          </template>
          {{ item.text }}
        </n-button>
      </n-space>
    </div>

    <n-divider style="margin: 0 16px; opacity: 0.2;" />

    <!-- Active category node builder panel -->
    <div v-if="activeCategory" style="display: flex; flex-direction: column; flex-grow: 1; overflow: hidden; padding-top: 8px;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 16px;">
        <span style="font-size: 14px; font-weight: 700; color: var(--n-primary-color);">
          {{ activeCategoryConfig?.text }}
        </span>
        <n-space :size="8" align="center">
          <n-button
            circle
            quaternary
            size="small"
            :title="allExpanded ? 'Recolher tudo' : 'Expandir tudo'"
            @click="emit('toggleExpanded')"
          >
            <template #icon>
              <n-icon size="18">
                <component :is="getIconComponent(allExpanded ? 'unfold_less' : 'unfold_more')" />
              </n-icon>
            </template>
          </n-button>
          <CreateNodeMenu :definitions="activeDefinitions" @select="emit('addItem', $event)" />
        </n-space>
      </div>

      <div style="flex-grow: 1; overflow-y: auto; padding: 0 16px 16px 16px;">
        <!--
          activeNodes já é o array reativo filtrado da store.
          ComponentQuickEditPanel recebe por referência e edita diretamente.
        -->
        <ComponentQuickEditPanel
          v-model:modelValue="props.activeNodes"
          :start-expanded="allExpanded"
          :label="activeCategoryConfig?.text"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex-grow: 1; padding: 24px; text-align: center; gap: 12px; height: 100%;"
    >
      <n-icon size="48" style="opacity: 0.4;"><ExtensionPuzzleOutline /></n-icon>
      <span style="font-size: 14px; opacity: 0.7;">
        Selecione uma categoria para começar
      </span>
    </div>
  </div>
</template>
