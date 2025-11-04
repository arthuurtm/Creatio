<template>
  <CGroup
    padding="10px"
    min-width="300px"
    background="transparent"
    direction="column"
    align="center"
    @click.stop
  >
    <CGroup align="center" padding="10px 30px">
      <p>{{ params.message }}</p>
    </CGroup>
    <CGroup gap="0.5rem" justify="center" align="center" width="100%">
      <CButton
        v-for="(btn, index) in params.buttons"
        :key="index"
        :text="btn.text"
        :classes="[btn.class, 'full']"
        @click="$emit('click', btn)"
      />
    </CGroup>
  </CGroup>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  dialogData: Object,
})
defineEmits(['click'])
const defaultValues = {
  buttons: [
    {
      text: 'OK',
      class: 'confirm',
    },
  ],
  message: 'Ocorreu um erro ao carregar a mensagem.',
}
const params = computed(() => props.dialogData ?? defaultValues)
</script>
