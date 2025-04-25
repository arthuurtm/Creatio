<template>
  <div class="groupElements">
    <label :for="field.model">{{ field.label }}</label>
    <input
      v-model="inputValue"
      class="input"
      :class="field.class"
      :type="field.type"
      :id="field.model"
      :placeholder="field.placeholder"
    />
    <CreateAnchor v-if="field.anchor" @emitEvent="reEmitEvent" :anchor="field.anchor" />
  </div>
</template>

<script>
import { computed } from 'vue'
import CreateAnchor from '@/components/elements/CreateAnchor.vue'

export default {
  name: 'CreateTextField',
  props: {
    field: Object,
    modelValue: String,
  },
  components: { CreateAnchor },
  emits: ['update:modelValue', 'emitEvent'],
  setup(props, { emit }) {
    const inputValue = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    return { inputValue }
  },
  methods: {
    reEmitEvent(actions) {
      this.$emit('emitEvent', actions)
    },
  },
}
</script>

<style scoped>
@import url('/src/assets/css/components/c-form.css');
</style>
