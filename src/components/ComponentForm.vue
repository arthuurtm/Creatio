<script setup>
defineProps({
  stepData: {
    type: Object,
    default: () => ({
      stepIndex: 0,
      fields: [],
      buttons: [
        {
          text: 'Voltar',
          action: { type: 'local', name: 'back' },
        },
      ],
      anchor: null,
      message: 'Ocorreu um erro ao carregar os dados do formulário.',
    }),
  },
  general: {
    type: Object,
    default: () => ({}),
  },
})
const emit = defineEmits(['submit-form', 'emit-event'])

function submitForm() {}
function handleFunctionEvent(event) {
  emit('emitEvent', event)
}
</script>

<template>
  <form class="form-container" @submit.prevent="submitForm">
    <div class="centered">
      <transition name="slide-left" mode="out-in">
        <div :key="stepData.stepIndex">
          <div class="sepElements">
            <p v-if="stepData.message">{{ stepData.message }}</p>
            <CreateTextField
              :fields="stepData.fields"
              @emitEvent="handleFunctionEvent"
              :storeName="general.store || 'form'"
            />
            <div class="text warning" id="capslock-text" style="display: none">
              <p>Capslock está ativo</p>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <CreateAnchor
      v-if="stepData.anchor"
      :anchor="stepData.anchor"
      @emitEvent="handleFunctionEvent"
    />
    <div class="sepButtons">
      <CreateButton
        v-if="stepData.buttons"
        :buttons="stepData.buttons"
        @emitEvent="handleFunctionEvent"
      />
    </div>
  </form>
</template>

<style scoped>
@import '/src/assets/css/components/c-form.css';
</style>
