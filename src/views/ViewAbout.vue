<template>
  <p></p>
</template>

<script setup>
import { onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter() // <- Chama aqui uma vez
const store = inject('stores')
const dialog = store.dialog

dialog.setDialog('DialogMessage', {
  title: 'Demonstração',
  message:
    'Este site está em fase de desenvolvimento. Algumas funcionalidades podem não estar completas ou apresentar instabilidades durante o uso.',
  btn1: {
    text: 'Ok',
    class: 'confirm',
    action: () => {
      router.push({ name: 'Login' })
    },
  },
})
</script>

<style scoped>
a {
  color: blue;
  cursor: pointer;
}
</style>
