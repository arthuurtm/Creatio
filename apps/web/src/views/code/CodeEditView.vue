<script setup lang="ts">
import { CodeOutlined } from "@vicons/material";
import { SunnyOutline, MoonOutline, HelpCircleOutline } from "@vicons/ionicons5";
import { NButton, NIcon, NTooltip } from "naive-ui";
import { computed, onMounted, onUnmounted, ref } from "vue";
import CodeDrawer from "@/components/modules/CodeDrawer.vue";
import ComponentNode from "@/components/modules/ComponentNode.vue";
import ConnectionStatusTag from "@/components/modules/ConnectionStatusTag.vue";
import Properties from "@/components/modules/Properties.vue";
import type RecentProjectsOverlay from "@/components/modules/RecentProjectsOverlay.vue";
import { useAutoCreateProject } from "@/composables/useAutoCreateProject";
import { useEditorPersistence } from "@/composables/useEditorPersistence.ts";
import { useEditorTour } from "@/composables/useEditorTour.ts";
import { useEditor } from "@/composables/useEditor";
import { useSettingsStore } from "@/stores/global";

const props = defineProps({ id: String });

const settingsStore = useSettingsStore();
const editor = useEditor();
const persistence = useEditorPersistence();
useAutoCreateProject(persistence);
const { startTour } = useEditorTour();

const canvasAreaRef = ref<HTMLElement | null>(null);
const showCodeDrawer = ref(false);

onMounted(async () => {
  if (props.id) {
    editor.setId(Number(props.id));
    await persistence.loadProject(Number(props.id));
  }
});

onUnmounted(() => editor.clearState());
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden relative">
    <Properties id="tour-properties" />

    <div class="grow h-full relative" ref="canvasAreaRef">
      <ComponentNode
        id="tour-canvas"
        @open-code-panel="showCodeDrawer = true"
      >
        <template #header>
          <div class="absolute top-3 right-3 z-[100] pointer-events-none flex gap-2">
            <div class="pointer-events-auto flex items-center gap-2">
              <NButton id="tour-btn-code" size="small" secondary round type="primary" @click="showCodeDrawer = true">
                <template #icon><NIcon><CodeOutlined /></NIcon></template>
                Código JS
              </NButton>
              <ConnectionStatusTag />
              <NTooltip trigger="hover" placement="bottom">
                <template #trigger>
                  <NButton
                    id="tour-theme"
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
              <NTooltip trigger="hover" placement="bottom">
                <template #trigger>
                  <NButton
                    size="small"
                    secondary
                    circle
                    @click="startTour"
                  >
                    <template #icon>
                      <NIcon size="16"><HelpCircleOutline /></NIcon>
                    </template>
                  </NButton>
                </template>
                Iniciar Tutorial
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
