<template>
  <DialogMessage
    :dialog-data="{
      message:
        'Este site está em fase de desenvolvimento. Algumas funcionalidades podem não estar completas ou apresentar instabilidades durante o uso.',
      buttons: [
        {
          text: 'Ok',
          class: 'confirm',
        },
      ],
    }"
    @click="router.push({ name: 'Home' })"
  />
</template>

<script setup>
import DialogMessage from '@/components/dialogs/DialogMessage.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
