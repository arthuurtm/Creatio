<template>
  <div class="modal" @click.stop>
    <p>{{ params.message }}</p>
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
import { useAppDynamicDialog } from '@/stores/dialog'
import { computed, ref, watch } from 'vue'
const dialogBoxStore = useAppDynamicDialog()
const params = ref({})
const emit = defineEmits(['close'])

watch(
  () => dialogBoxStore.data,
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
  emit('close')
}
</script>

<style scoped>
@import url('/src/assets/css/components/c-dialogMessage.css');
</style>
