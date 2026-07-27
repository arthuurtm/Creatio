<template>
  <v-card
    variant="outlined"
    rounded="xl"
    :hover="true"
    class="project-card"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    <v-list-item
      :title="item.title"
      :subtitle="item.description || 'Sem descrição'"
      lines="two"
      class="py-3"
    >
      <!-- Ícone do projeto -->
      <template #prepend>
        <v-avatar color="primary" variant="tonal" rounded="lg" size="40" class="mr-1">
          <v-icon size="20">terminal</v-icon>
        </v-avatar>
      </template>

      <!-- Menu e data -->
      <template #append>
        <div class="d-flex flex-column align-end ga-1">
          <!-- Menu contextual -->
          <v-menu location="bottom end" :close-on-content-click="true">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                icon="more_vert"
                variant="text"
                size="x-small"
                density="comfortable"
                @click.stop
              />
            </template>
            <v-list density="compact" min-width="180" rounded="xl">
              <v-list-item prepend-icon="edit"           title="Renomear"  @click.stop="$emit('rename', item)"    />
              <v-list-item prepend-icon="content_copy"   title="Duplicar"  @click.stop="$emit('duplicate', item)" />
              <v-divider class="my-1" />
              <v-list-item prepend-icon="delete_outline" title="Excluir"   class="text-error" @click.stop="$emit('delete', item)" />
            </v-list>
          </v-menu>

          <!-- Data de modificação -->
          <span class="text-caption text-disabled">
            {{ formatRelativeDate(item.updatedAt || item.createdAt) }}
          </span>
        </div>
      </template>
    </v-list-item>
  </v-card>
</template>

<script setup lang="ts">
defineProps({
  item:  { type: Object, required: true },
  width: { type: [String, Number], default: '100%' },
});

defineEmits(['click', 'rename', 'duplicate', 'delete']);

function formatRelativeDate(date: any): string {
  if (!date) return '';
  try {
    const d    = new Date(date);
    const diff = Date.now() - d.getTime();
    const min  = Math.floor(diff / 60000);
    const h    = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (min  < 1)  return 'agora mesmo';
    if (min  < 60) return `há ${min} min`;
    if (h    < 24) return `há ${h}h`;
    if (days < 7)  return `há ${days} dia${days !== 1 ? 's' : ''}`;
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d);
  } catch { return String(date); }
}
</script>

<style scoped>
.project-card {
  cursor: pointer;
}
</style>
