<script setup>
const props = defineProps({
  panel: {
    type: Object,
    required: true,
    default: () => ({
      title: '',
      actions: [],
      footerButtons: [],
    }),
  },
})

const emit = defineEmits(['emit-event'])
</script>

<template>
  <CGroup
    direction="column"
    width="100%"
    height="100%"
    background="fff"
    gap="1rem"
    style="padding: 1.5rem; overflow: hidden"
  >
    <!-- TÍTULO -->
    <h3 style="margin: 0; font-size: 1.2rem">{{ panel.title }}</h3>

    <!-- AÇÕES -->
    <CGroup grow direction="column" gap="0.5rem" style="overflow-y: auto; padding-right: 0.5rem">
      <CButton
        v-for="(item, index) in panel.actions"
        :key="index"
        :icon="item.icon"
        :text="item.text"
        classes="symbolic left"
        style="justify-content: flex-start"
        @click="
          () => {
            item.action && item.action()
            emit('emit-event', item)
          }
        "
      />
    </CGroup>

    <!-- RODAPÉ -->
    <CGroup direction="row" justify="space-between" align="center" padding="0.5rem 0">
      <CButton
        v-for="(btn, index) in panel.footerButtons"
        :key="index"
        :icon="btn.icon"
        classes="symbolic"
        @click="
          () => {
            btn.action && btn.action()
            emit('emit-event', btn)
          }
        "
      />
    </CGroup>
  </CGroup>
</template>
