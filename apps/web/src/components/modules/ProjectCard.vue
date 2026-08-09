<template>
  <n-card 
    class="rounded-xl cursor-pointer transition-[box-shadow,border-color] duration-200"
    hoverable
    @click="emit('click')"
  >
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-3 grow min-w-0">
        <n-avatar round class="shrink-0" :style="{ backgroundColor: 'rgba(var(--v-theme-primary), 0.12)', color: 'rgb(var(--v-theme-primary))' }">
          <n-icon size="20"><TerminalOutline /></n-icon>
        </n-avatar>
        <div class="flex flex-col min-w-0 grow">
          <span class="text-sm font-bold truncate">{{ item.title }}</span>
          <span class="text-xs opacity-60 truncate mt-0.5">{{ item.description || 'Sem descrição' }}</span>
        </div>
      </div>

      <div class="flex flex-col items-end gap-1 shrink-0 ml-3">
        <n-dropdown 
          trigger="click" 
          placement="bottom-end" 
          :options="dropdownOptions" 
          @select="handleSelect"
        >
          <n-button 
            circle 
            quaternary 
            size="small" 
            @click.stop
          >
            <template #icon>
              <n-icon><EllipsisVertical /></n-icon>
            </template>
          </n-button>
        </n-dropdown>
        
        <span class="text-[10px] opacity-50">
          {{ formatRelativeDate(item.updatedAt || item.createdAt) }}
        </span>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { NIcon } from 'naive-ui';
import { TerminalOutline, EllipsisVertical, CreateOutline, CopyOutline, TrashOutline } from '@vicons/ionicons5';

const props = defineProps({
  item:  { type: Object, required: true },
  width: { type: [String, Number], default: '100%' },
});

const emit = defineEmits(['click', 'rename', 'duplicate', 'delete']);

const dropdownOptions = [
  {
    label: 'Renomear',
    key: 'rename',
    icon: () => h(NIcon, { size: 16 }, { default: () => h(CreateOutline) })
  },
  {
    label: 'Duplicar',
    key: 'duplicate',
    icon: () => h(NIcon, { size: 16 }, { default: () => h(CopyOutline) })
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: 'Excluir',
    key: 'delete',
    icon: () => h(NIcon, { size: 16, color: 'rgb(var(--v-theme-error))' }, { default: () => h(TrashOutline) })
  }
];

function handleSelect(key: string) {
  if (key === 'rename') emit('rename', props.item);
  if (key === 'duplicate') emit('duplicate', props.item);
  if (key === 'delete') emit('delete', props.item);
}

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
