<template>
  <!-- <component :is="rules?.includes('group') ? 'div' : 'fragment'" class="button-group"> -->
  <template v-for="(button, index) in props.buttons" :key="index">
    <component
      v-if="!button?.rules?.includes('hide')"
      :is="button.tag || 'button'"
      :class="[!button.tag && 'btn', button.class, button?.position]"
      :id="button.id || ''"
      :type="button.type || 'submit'"
      @click="
        typeof button.action === 'function'
          ? button.action()
          : emitEvent(
              button.action?.name || '',
              button.action?.value || '',
              button.action?.type || '',
            )
      "
    >
      <span v-if="button.icon" class="material-symbols-outlined notranslate">
        {{ button.icon }}
      </span>
      <img
        v-if="button.img"
        :src="button.img.src"
        :alt="button.img.alt"
        :class="button.img"
        :style="button.img?.style"
      />
      <p v-if="button.text">{{ button.text }}</p>
    </component>
  </template>
  <!-- </component> -->
</template>

<script setup>
const props = defineProps({
  buttons: {
    type: Array,
    default: () => [{}],
  },
  rules: {
    type: Array,
    default: () => [],
  },
})

const emits = defineEmits(['emitEvent'])

const emitEvent = (action, value, type) => {
  emits('emitEvent', { action, value, type })
}
</script>

<style scoped></style>
