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
        <v-avatar color="primary" variant="tonal" rounded="lg" size="44" class="project-icon flex-shrink-0">
          <v-icon color="primary">terminal</v-icon>
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

      <!-- RODAPÉ: versão + ação -->
      <div class="d-flex align-center justify-space-between pt-2">
        <v-chip size="small" variant="tonal" color="primary" label>
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
defineProps({
  item: { type: Object, required: true },
  width: { type: [String, Number], default: '100%' },
});
defineEmits(['click']);

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
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, border-color 0.25s ease;
  cursor: pointer;
  background-color: rgb(var(--v-theme-surface)) !important;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  outline: none;
}

/* Hover com elevação e cor de borda */
.project-card:hover {
  transform: translateY(-4px) scale(1.015);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08) !important;
  border-color: rgb(var(--v-theme-primary)) !important;
}

/* Focus via teclado — acessibilidade */
.project-card:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary)) !important;
  outline-offset: 2px;
  transform: translateY(-2px);
}

.project-icon {
  transition: transform 0.25s ease;
}

.project-card:hover .project-icon {
  transform: rotate(-5deg) scale(1.08);
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
