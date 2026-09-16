<script setup lang="ts">
import { CodeOutlined } from "@vicons/material";
import { SunnyOutline, MoonOutline } from "@vicons/ionicons5";
import { NButton, NIcon, NTooltip } from "naive-ui";
import { computed, onMounted, onUnmounted, ref } from "vue";
import CodeDrawer from "@/components/modules/CodeDrawer.vue";
import ComponentNode from "@/components/modules/ComponentNode.vue";
import ConnectionStatusTag from "@/components/modules/ConnectionStatusTag.vue";
import Properties from "@/components/modules/Properties.vue";
import type RecentProjectsOverlay from "@/components/modules/RecentProjectsOverlay.vue";
import { useAutoCreateProject } from "@/composables/useAutoCreateProject";
import { useEditorExplorer } from "@/composables/useEditorExplorer.ts";
import { useEditorPersistence } from "@/composables/useEditorPersistence.ts";
import { useSettingsStore } from "@/stores/global";

const props = defineProps({ id: String });

const settingsStore = useSettingsStore();
const { editorStore } = useEditorExplorer();
const persistence = useEditorPersistence();
useAutoCreateProject(editorStore, persistence);

const canvasAreaRef = ref<HTMLElement | null>(null);
const showCodeDrawer = ref(false);

const flowNodes = computed<any>({
  get: () => editorStore.nodes,
  set: (val) => editorStore.setState({ nodes: val }),
});
const flowEdges = computed<any>({
  get: () => editorStore.connections,
  set: (val) => editorStore.setState({ connections: val }),
});

onMounted(async () => {
  if (props.id) {
    editorStore.setId(Number(props.id));
    await persistence.loadProject(Number(props.id));
  }
});

onUnmounted(() => editorStore.clearState());
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden relative">
    <Properties />

    <div class="grow h-full relative" ref="canvasAreaRef">
      <ComponentNode
        v-model:nodes="flowNodes"
        v-model:edges="flowEdges"
        @open-code-panel="showCodeDrawer = true"
      >
        <template #header>
          <div class="absolute top-3 right-3 z-[100] pointer-events-none flex gap-2">
            <div class="pointer-events-auto flex items-center gap-2">
              <NButton size="small" secondary round type="primary" @click="showCodeDrawer = true">
                <template #icon><NIcon><CodeOutlined /></NIcon></template>
                Código JS
              </NButton>
              <ConnectionStatusTag />
              <NTooltip trigger="hover" placement="bottom">
                <template #trigger>
                  <NButton
                    size="small"
                    secondary
                    circle
                    @click="settingsStore.toggleTheme"
                  >
                    <template #icon>
                      <NIcon size="16">
                        <SunnyOutline v-if="settingsStore.theme === 'dark'" />
                        <MoonOutline v-else />
                      </NIcon>
                    </template>
                  </NButton>
                </template>
                {{ settingsStore.theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro' }}
              </NTooltip>
            </div>
          </div>
        </template>
      </ComponentNode>

      <CodeDrawer v-model:show="showCodeDrawer" :to="canvasAreaRef" />
    </div>

    <RecentProjectsOverlay v-if="!id" ref="overlayRef" />
  </div>
</template>
