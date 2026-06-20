<template>
  <v-card :width="width" class="project-card rounded-xl border-opacity-10 position-relative pa-5" border elevation="0" v-bind="$attrs">
    <div class="d-flex align-start ga-4 mb-4">
      <v-avatar color="primary" variant="tonal" rounded="lg" size="44" class="project-icon">
        <v-icon color="primary">terminal</v-icon>
      </v-avatar>
      <div class="flex-grow-1 min-width-0">
        <div class="text-subtitle-1 font-weight-bold text-truncate leading-tight">
          {{ item.title }}
        </div>
        <div class="text-caption text-medium-emphasis mt-0.5">
          Modificado em {{ formatDate(item.updatedAt || item.createdAt) }}
        </div>
      </div>
    </div>

    <div class="project-description text-body-2 text-medium-emphasis mb-4">
      {{ item.description || "Sem descrição disponível." }}
    </div>

    <div class="d-flex align-center justify-space-between mt-auto pt-2">
      <v-chip size="small" variant="flat" color="surface-variant" label class="font-weight-medium text-caption rounded-lg px-2">
        v{{ item.version || "1.0.0" }}
      </v-chip>
      <div class="d-flex align-center text-primary text-caption font-weight-bold ga-1">
        Abrir código
        <v-icon size="small">chevron_right</v-icon>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
defineProps({
  item: { type: Object, required: true },
  width: { type: [String, Number], default: '100%' },
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
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, border-color 0.25s ease;
  cursor: pointer;
  background-color: rgb(var(--v-theme-surface)) !important;
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.project-card:hover {
  transform: translateY(-4px) scale(1.015);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08) !important;
  border-color: rgb(var(--v-theme-primary)) !important;
}

.project-icon {
  transition: transform 0.25s ease;
}

.project-card:hover .project-icon {
  transform: rotate(-5deg) scale(1.05);
}

.project-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 40px;
  line-height: 20px;
}

.leading-tight {
  line-height: 1.25 !important;
}
</style>
