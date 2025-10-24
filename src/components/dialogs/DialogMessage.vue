<template>
  <div class="modal" @click.stop>
    <div class="modal-message">
      <p>{{ params.message }}</p>
    </div>
    <div class="modal-buttons">
      <CButton
        v-for="(btn, index) in params.buttons"
        :key="index"
        :text="btn.text"
        :classes="btn.class"
        @click="dialogFunctionController(btn)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppDynamicDialog } from '@/stores'

const emit = defineEmits('close')
const dialog = useAppDynamicDialog()
const params = computed(() => dialog.getData || [{}])
if (!params.value.buttons) {
  params.value.buttons = [
    {
      text: 'OK',
      class: 'confirm',
      type: 'button',
    },
  ]
}

function dialogFunctionController(btn) {
  if (typeof btn.action === Function) {
    btn.action?.()
    emit('close')
  } else {
    emit('close')
    return null
  }
}
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
