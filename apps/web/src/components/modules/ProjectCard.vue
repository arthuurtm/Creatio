<template>
  <v-card
    :width="width"
    class="project-card rounded-xl position-relative"
    border
    elevation="0"
    v-bind="$attrs"
    tabindex="0"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <div class="pa-5 d-flex flex-column fill-height">
      <!-- CABEÇALHO: ícone + título + data -->
      <div class="d-flex align-start ga-4 mb-4">
        <v-avatar :color="accentColor" variant="tonal" rounded="lg" size="44" class="project-icon flex-shrink-0">
          <v-icon :color="accentColor">terminal</v-icon>
        </v-avatar>
        <div class="flex-grow-1 min-width-0">
          <div class="text-subtitle-1 font-weight-bold text-truncate leading-tight">
            {{ item.title }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            Modificado em {{ formatDate(item.updatedAt || item.createdAt) }}
          </div>
        </div>
      </div>

      <!-- DESCRIÇÃO (2 linhas) -->
      <div class="project-description text-body-2 text-medium-emphasis mb-4 flex-grow-1">
        {{ item.description || "Sem descrição disponível." }}
      </div>

      <!-- RODAPÉ: versão (metadado, discreto) + ação (destaque) -->
      <div class="d-flex align-center justify-space-between pt-2">
        <v-chip size="small" variant="outlined" color="default" label>
          v{{ item.version || "1.0.0" }}
        </v-chip>
        <v-chip
          size="small"
          variant="tonal"
          color="primary"
          append-icon="arrow_forward"
          class="action-chip font-weight-medium"
        >
          Abrir
        </v-chip>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  item: { type: Object, required: true },
  width: { type: [String, Number], default: '100%' },
});
defineEmits(['click']);

// Alterna a cor do ícone entre primary/secondary/tertiary com base no item,
// pra grade de cards não parecer um bloco monocromático repetido.
const accentPalette = ['primary', 'secondary', 'tertiary'];
const accentColor = computed(() => {
  const key = String(props.item?.id ?? props.item?.title ?? '');
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash + key.charCodeAt(i)) % accentPalette.length;
  }
  return accentPalette[hash];
});

function formatDate(date: any) {
  if (!date) return '';
  try {
    const d = new Date(date);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  } catch {
    return String(date);
  }
}
</script>

<style scoped>
.project-card {
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
  background-color: rgb(var(--v-theme-surface)) !important;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  outline: none;
}

/* Hover com elevação sutil e cor de borda */
.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.07) !important;
  border-color: rgb(var(--v-theme-primary)) !important;
}

/* Focus via teclado — acessibilidade */
.project-card:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary)) !important;
  outline-offset: 2px;
  transform: translateY(-2px);
}

.project-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.leading-tight {
  line-height: 1.25 !important;
}

.action-chip {
  transition: transform 0.2s ease;
}

.project-card:hover .action-chip {
  transform: translateX(2px);
}
</style>
