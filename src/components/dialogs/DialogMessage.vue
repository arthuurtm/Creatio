<template>
  <div class="modal" @click.stop>
    <div class="modal-message">
      <p>{{ params.message }}</p>
    </div>
    <div class="modal-buttons">
      <CreateButton :buttons="params.buttons" @emitEvent="$emit('close')" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppDynamicDialog } from '@/stores'

const dialog = useAppDynamicDialog()
const params = computed(() => dialog.getData || [{}])
defineEmits('close')
</script>

<style scoped>
/* Estilo da janela modal */
.modal {
  background: transparent;
  border-radius: 8px;
  padding: 10px;
  min-width: 300px;
  max-width: 600px;
  color: var(--text);
}

.modal-message {
  padding: 10px 30px;
  text-align: center;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn,
.btn-destructive {
  margin: 5px;
}

.callOverlay {
  cursor: pointer;
}
</style>
