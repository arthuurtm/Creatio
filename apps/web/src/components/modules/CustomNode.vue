<template>
  <NCard
    class="rete-node"
    :class="{ selected: data.selected }"
    :style="[
      cssVars,
      {
        width: data.width ? data.width + 'px' : 'auto',
        minWidth: '220px'
      }
    ]"
    size="small"
    hoverable
    :segmented="{ content: true }"
    content-style="padding: 8px 0;"
  >
    <!-- Cabeçalho: título + tipo, usando o layout nativo do NCard -->
    <template #header>
      <NText strong class="node-title">{{ data.label }}</NText>
    </template>
    <template #header-extra>
      <NTag
        size="small"
        :bordered="false"
        :type="data.type === 'statement' ? 'success' : 'warning'"
      >
        {{ data.type === 'statement' ? 'comando' : 'valor' }}
      </NTag>
    </template>

    <!-- Conteúdo com colunas organizadas (Inputs à esquerda, Outputs à direita) -->
    <div class="rete-node-body">
      <!-- Coluna da Esquerda: Inputs -->
      <div class="rete-column inputs-column">
        <div
          v-for="[key, input] in Object.entries(data.inputs || {})"
          :key="'in-' + key"
          class="socket-row input-row"
        >
          <Ref
            class="socket-circle socket-in"
            :class="{
              'is-control': input.socket?.isControl,
              'is-ref': input.socket?.isRef,
              'is-value': !input.socket?.isControl && !input.socket?.isRef
            }"
            :emit="emit"
            :data="{ type: 'socket', side: 'input', key: key, nodeId: data.id, payload: input.socket }"
          />

          <!-- Campo editável: NFormItem dá o rótulo nativo do Naive -->
          <NFormItem
            v-if="hasControl(input)"
            class="field"
            :label="needsLabel(input.control) ? labelOf(key, input.label) : undefined"
            label-placement="top"
            size="small"
            :show-feedback="false"
          >
            <Ref :emit="emit" :data="{ type: 'control', payload: input.control }" />
          </NFormItem>

          <!-- Sem controle (ou controle não suportado): só o rótulo -->
          <NText v-else depth="3" class="socket-label">
            {{ labelOf(key, input.label) }}
          </NText>
        </div>
      </div>

      <!-- Coluna da Direita: Outputs -->
      <div class="rete-column outputs-column">
        <div
          v-for="[key, output] in Object.entries(data.outputs || {})"
          :key="'out-' + key"
          class="socket-row output-row"
        >
          <NFormItem
            v-if="hasControl(output)"
            class="field field-right"
            :label="needsLabel(output.control) ? labelOf(key, output.label) : undefined"
            label-placement="top"
            label-align="right"
            size="small"
            :show-feedback="false"
          >
            <Ref :emit="emit" :data="{ type: 'control', payload: output.control }" />
          </NFormItem>
          <NText v-else-if="output.label || key" depth="3" class="socket-label">
            {{ labelOf(key, output.label) }}
          </NText>

          <Ref
            class="socket-circle socket-out"
            :class="{
              'is-control': output.socket?.isControl,
              'is-ref': output.socket?.isRef,
              'is-value': !output.socket?.isControl && !output.socket?.isRef
            }"
            :emit="emit"
            :data="{ type: 'socket', side: 'output', key: key, nodeId: data.id, payload: output.socket }"
          />
        </div>
      </div>
    </div>

    <!-- Controles centrais embutidos (os não suportados ficam de fora) -->
    <template v-if="visibleControls.length">
      <NDivider class="node-divider" />
      <div class="rete-node-controls">
        <NFormItem
          v-for="item in visibleControls"
          :key="'ctrl-' + item.key"
          :label="item.showLabel ? item.label : undefined"
          label-placement="top"
          size="small"
          :show-feedback="false"
        >
          <Ref :emit="emit" :data="{ type: 'control', payload: item.control }" />
        </NFormItem>
      </div>
    </template>
  </NCard>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from "vue";
import { Ref } from "rete-vue-plugin";
import { NCard, NDivider, NFormItem, NTag, NText, useThemeVars } from "naive-ui";
import {
  fieldLabel,
  isRenderableControl,
  needsFieldLabel
} from "@projeto/compiler";

interface NodeSocket {
  label?: string;
  socket: any;
  control?: unknown;
  showControl?: boolean;
}

interface NodeViewData {
  id: string;
  label: string;
  type: "statement" | "expression" | "unknown";
  width?: number;
  selected?: boolean;
  inputs?: Record<string, NodeSocket>;
  outputs?: Record<string, NodeSocket>;
  controls?: Record<string, unknown>;
}

export default defineComponent({
  components: {
    Ref,
    NCard,
    NDivider,
    NFormItem,
    NTag,
    NText,
  },
  props: {
    data: {
      type: Object as PropType<NodeViewData>,
      required: true,
    },
    emit: {
      type: Function as PropType<(...args: unknown[]) => unknown>,
      required: true,
    },
  },
  setup() {
    // Só o que o Naive não cobre: cores dos sockets e destaque de seleção
    const themeVars = useThemeVars();

    const cssVars = computed(() => {
      const t = themeVars.value;
      return {
        "--node-primary": t.primaryColor,
        "--node-control": t.warningColor,
        "--node-ref": t.infoColor,
        "--node-value": t.successColor,
      };
    });

    return { cssVars };
  },
  computed: {
    visibleControls(): { key: string; control: any; label: string; showLabel: boolean }[] {
      return Object.entries(this.data.controls || {})
        .filter(([, control]) => isRenderableControl(control))
        .map(([key, control]) => ({
          key,
          control,
          label: fieldLabel(key, (control as any)?.options?.label),
          showLabel: needsFieldLabel(control),
        }));
    },
  },
  methods: {
    // O controle só conta se existir, estiver habilitado e for de um tipo que sabemos desenhar
    hasControl(socket: NodeSocket): boolean {
      return (
        !!socket.control &&
        (socket.showControl ?? true) &&
        isRenderableControl(socket.control)
      );
    },
    needsLabel(control: unknown): boolean {
      return needsFieldLabel(control);
    },
    labelOf(key: string, label?: unknown): string {
      return fieldLabel(key, label);
    },
  },
});
</script>

<style scoped>
/* O visual (borda, raio, sombra, fonte, cores) vem do NCard/NFormItem/NText.
   Aqui ficam só layout, sockets e o destaque de seleção. */

.rete-node {
  user-select: none;
  /* sockets ficam sobre a borda do card */
  overflow: visible;
}

.rete-node.selected {
  border-color: var(--node-primary);
  box-shadow: 0 0 0 1px var(--node-primary) !important;
}

.node-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-divider {
  margin: 6px 0;
}

.rete-node-body {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.rete-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Inputs ocupam o espaço restante (campos editáveis precisam de largura);
   outputs ocupam só o necessário para o rótulo */
.inputs-column {
  align-items: flex-start;
  flex: 1 1 0;
  min-width: 0;
}

.outputs-column {
  align-items: flex-end;
  flex: 0 1 auto;
}

.socket-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 22px;
  width: 100%;
}

.input-row {
  justify-content: flex-start;
}

.output-row {
  justify-content: flex-end;
}

.socket-label {
  font-size: 12px;
  white-space: nowrap;
  padding: 0 6px;
}

/* Campo: NFormItem com rótulo no topo, sem margens extras */
.field {
  flex: 1;
  min-width: 0;
}

.input-row .field {
  padding-right: 12px;
}

.output-row .field {
  padding-left: 12px;
}

.field :deep(.n-form-item-label) {
  padding: 0 0 2px 2px;
}

.rete-node-controls {
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Sockets (sem equivalente no Naive) */
:deep(.socket-circle) {
  display: inline-block;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  box-sizing: border-box;
}

:deep(.socket) {
  all: unset !important;
}

:deep(.socket-circle:hover) {
  transform: scale(1.3);
}

/* Control (fluxo de execução) - quadrado */
:deep(.socket-circle.is-control) {
  border-radius: 3px;
  background: var(--node-control);
}
:deep(.socket-circle.is-control:hover) {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--node-control) 35%, transparent);
}

/* Ref (variáveis) - losango */
:deep(.socket-circle.is-ref) {
  border-radius: 2px;
  background: var(--node-ref);
  transform: rotate(45deg);
}
:deep(.socket-circle.is-ref:hover) {
  transform: rotate(45deg) scale(1.3);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--node-ref) 35%, transparent);
}

/* Value (dados) - círculo */
:deep(.socket-circle.is-value) {
  border-radius: 50%;
  background: var(--node-value);
}
:deep(.socket-circle.is-value:hover) {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--node-value) 35%, transparent);
}

:deep(.socket-in) {
  margin-left: -7px;
}

:deep(.socket-out) {
  margin-right: -7px;
}
</style>
