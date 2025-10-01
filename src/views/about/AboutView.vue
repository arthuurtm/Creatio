<template>
  <p></p>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAppDynamicDialog } from '@/stores'
import DialogMessage from '@/components/dialogs/DialogMessage.vue'

const router = useRouter()
const dialog = useAppDynamicDialog()

dialog.setDialog(DialogMessage, {
  title: 'Demonstração',
  message:
    'Este site está em fase de desenvolvimento. Algumas funcionalidades podem não estar completas ou apresentar instabilidades durante o uso.',
  buttons: [
    {
      text: 'Ok',
      class: 'confirm',
      action: () => {
        router.push({ name: 'Home' })
      },
    },
  ],
})
</script>
