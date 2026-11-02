<template>
  <n-card
    class="project-card"
    hoverable
    @click="emit('click')"
  >
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-3 grow min-w-0">
        <n-avatar round class="shrink-0 project-avatar">
          <n-icon size="20"><TerminalOutline /></n-icon>
        </n-avatar>
        <div class="flex flex-col min-w-0 grow">
          <span class="project-title truncate">{{ item.title }}</span>
          <span class="project-desc truncate mt-0.5">{{ item.description || 'Sem descrição' }}</span>
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

        <span class="project-date">
          {{ formatRelativeDate(item.updatedAt || item.createdAt) }}
        </span>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { h } from "vue";
import { NIcon } from "naive-ui";
import { TerminalOutline, EllipsisVertical, CreateOutline, CopyOutline, TrashOutline } from "@vicons/ionicons5";

const props = defineProps({
  item:  { type: Object, required: true },
  width: { type: [String, Number], default: "100%" },
});

const emit = defineEmits(["click", "rename", "duplicate", "delete"]);

const dropdownOptions = [
  {
    label: "Renomear",
    key: "rename",
    icon: () => h(NIcon, { size: 16 }, { default: () => h(CreateOutline) }),
  },
  {
    label: "Duplicar",
    key: "duplicate",
    icon: () => h(NIcon, { size: 16 }, { default: () => h(CopyOutline) }),
  },
  {
    type: "divider",
    key: "d1",
  },
  {
    label: "Excluir",
    key: "delete",
    icon: () => h(NIcon, { size: 16, class: "text-error" }, { default: () => h(TrashOutline) }),
  },
];

function handleSelect(key: string) {
  if (key === "rename") emit("rename", props.item);
  if (key === "duplicate") emit("duplicate", props.item);
  if (key === "delete") emit("delete", props.item);
}

function formatRelativeDate(date: any): string {
  if (!date) return "";
  try {
    const d    = new Date(date);
    const diff = Date.now() - d.getTime();
    const min  = Math.floor(diff / 60000);
    const h    = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (min  < 1)  return "agora mesmo";
    if (min  < 60) return `há ${min} min`;
    if (h    < 24) return `há ${h}h`;
    if (days < 7)  return `há ${days} dia${days !== 1 ? "s" : ""}`;
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(d);
  } catch { return String(date); }
}
</script>

<style scoped>
.project-card {
  border-radius: var(--radius-md) !important;
  cursor: pointer;
  transition:
    box-shadow var(--transition-base),
    border-color var(--transition-base);
}

.project-avatar {
  background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
}

.text-error {
  color: var(--color-error);
}

.project-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
}

.project-desc {
  font-size: 12px;
  opacity: 0.6;
  color: var(--color-text-2);
}

.project-date {
  font-size: 10px;
  opacity: 0.5;
  color: var(--color-text-3);
}
</style>
