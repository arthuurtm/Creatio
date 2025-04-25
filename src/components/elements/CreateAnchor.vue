<template>
  <a v-if="anchor" class="form-link" :class="anchor.class" :id="anchor.model"
    @click="emitEvent(anchor.action.event, anchor.action.value, anchor.action.type)">
    {{ anchor.text }}</a>
</template>

<script>
import { computed } from "vue";

export default {
  name: "CreateAnchor",
  props: {
    anchor: Object,
    modelValue: String
  },
  emits: ["update:modelValue", "emitEvent"],
  setup(props, { emit }) {
    // Criamos uma propriedade reativa que sincroniza com modelValue
    const inputValue = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value)
    });

    return { inputValue };
  },
  methods: {
    emitEvent(action, value, type) {
      this.$emit('emitEvent', { action: action, value: value, type: type });
    },
  },
};
</script>
