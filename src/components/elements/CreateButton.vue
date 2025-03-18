<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="sepButtons">
    <div v-for="(button, index) in buttons" :key="index" class="group-button"
      :class="button.position === 'left' && 'left'">
      <button class="btn" :class="button.class" :id="button.id" :type="button.type"
        @click="emitEvent(button.action.name, button.action.value, button.action.type)">
        {{ button.text }}
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
export default {
  name: "CreateButton", props: {
    buttons: Object,
    modelValue: String,
  },
  emits: ["update:modelValue", "emitEvent"],
  setup(props, { emit }) {
    // Criamos uma propriedade reativa que sincroniza com modelValue
    const inputValue = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value)
    });

    console.log('CreateButton() > buttons: ', props.buttons);

    return { inputValue };
  },
  methods: {
    emitEvent(action, value, type) {
      console.log('Emitindo: ', { action, value, type })
      this.$emit('emitEvent', { action, value, type });
    },
  },
};
</script>

<style scoped></style>
