<template>
  <div>
    <!-- SKELETON -->
    <div v-if="loading" style="display: flex; flex-direction: column; gap: 8px;">
      <n-card v-for="n in 6" :key="n" style="border-radius: 12px; padding: 12px;">
        <n-space align="center" :size="12">
          <n-skeleton circle style="height: 36px; width: 36px;" />
          <n-space vertical :size="6">
            <n-skeleton text style="width: 150px; height: 16px;" />
            <n-skeleton text style="width: 100px; height: 12px;" />
          </n-space>
        </n-space>
      </n-card>
    </div>

    <!-- LISTA: boxed-list-separate (cada item é um card próprio) -->
    <div v-else style="display: flex; flex-direction: column; gap: 8px;">
      <ProjectCard
        v-for="(card, index) in items"
        :key="card.id ?? index"
        :item="card"
        @click="emitAction(card)"
        @rename="$emit('rename', $event)"
        @duplicate="$emit('duplicate', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProjectCard from '@/components/modules/ProjectCard.vue';

defineProps({
  items:     { type: Object,  required: true },
  styleType: { type: String,  default: 'list' },
  loading:   { type: Boolean, default: false },
});

const emits = defineEmits(['emitEvent', 'rename', 'duplicate', 'delete']);

function emitAction(card: any) {
  if (card.action && typeof card.action === 'function') {
    card.action();
  } else {
    emits('emitEvent', { id: card.id, type: 'open' });
  }
}
</script>
