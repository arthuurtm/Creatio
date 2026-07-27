<template>
  <div>
    <!-- SKELETON -->
    <div v-if="loading" class="d-flex flex-column ga-2">
      <v-skeleton-loader
        v-for="n in 6"
        :key="n"
        type="list-item-avatar-two-line"
        rounded="xl"
      />
    </div>

    <!-- LISTA: boxed-list-separate (cada item é um card próprio) -->
    <div v-else class="d-flex flex-column ga-2">
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

const props = defineProps({
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
