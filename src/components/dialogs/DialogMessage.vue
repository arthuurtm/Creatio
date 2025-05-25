<template>
  <div class="modal" @click.stop>
    <div class="modal-message">
      <p>{{ params.message }}</p>
    </div>
    <div class="modal-buttons">
      <button class="btn" :class="params.btn1?.class" @click="handleBtn1">
        {{ params.btn1?.text }}
      </button>
      <button class="btn" v-if="params.btn2?.text" :class="params.btn2?.class" @click="handleBtn2">
        {{ params.btn2?.text }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, inject } from 'vue'

const params = ref({})
const emit = defineEmits(['close'])
const store = inject('stores')

watch(
  () => store.dialog.getData,
  (newData) => {
    params.value = {
      title: newData?.title || 'Confirmação',
      message: newData?.message || 'Você tem certeza desta ação?',
      btn1: {
        text: newData?.btn1?.text || 'Ok',
        class: newData?.btn1?.class || '',
        action: newData?.btn1?.action || close,
      },
      btn2: {
        text: newData?.btn2?.text || '',
        class: newData?.btn2?.class || '',
        action: newData?.btn2?.action || close,
      },
    }
  },
  { immediate: true },
)

function handleBtn1() {
  if (params.value.btn1?.action) params.value.btn1.action()
  close()
}

function handleBtn2() {
  if (params.value.btn2?.action) params.value.btn2.action()
  close()
}

function close() {
  emit('close', true)
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
