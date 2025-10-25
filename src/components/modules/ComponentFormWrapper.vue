<template>
  <LayoutForm>
    <template #title>{{ title }}</template>
    <template #subTitle>{{ subTitle }}</template>
    <template #formInfo><slot name="formInfo" /></template>

    <template #header-actions>
      <CButton
        icon="settings"
        :classes="['symbolic', 'no-scalling']"
        style="margin-left: auto"
        @click="settingsVisible = !settingsVisible"
      />
    </template>

    <form class="form-container centered" @submit.prevent="$emit('submit')">
      <transition name="slide-left" mode="out-in">
        <div class="form" :key="currentStep">
          <slot v-if="hasSlot('buttons') && hasSlot('form')" name="form" />
          <p v-else>
            Não foi possível carregar os dados do formulário. Tente novamente mais tarde!
          </p>
        </div>
      </transition>
      <div class="buttons-container">
        <slot v-if="hasSlot('buttons') && hasSlot('form')" name="buttons" />
        <CButton v-else text="Voltar" @click="$router.back()" />
      </div>
    </form>
  </LayoutForm>
  <ComponentDialog
    :component="DialogSettings"
    :fullscreen="true"
    title="Configurações"
    :is-visible="settingsVisible"
    @close="settingsVisible = !settingsVisible"
  />
  <CLoading v-if="loading" :full="true" />
</template>

<script setup>
import { useSlots, ref } from 'vue'
import LayoutForm from '@/layouts/LayoutForm.vue'
import DialogSettings from '../dialogs/DialogSettings.vue'
defineProps({ title: String, subTitle: String, currentStep: Number, loading: Boolean })
defineEmits(['submit'])
const slots = useSlots()
const settingsVisible = ref(false)

function hasSlot(name) {
  return !!slots[name]
}
</script>

<style>
.form-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 30px;
  justify-content: center;
  height: 100%;
  width: 100%;
  word-break: break-word;
  overflow-wrap: break-word;
}

.groupElements {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: inherit;
}

.groupElements label,
.groupElements a {
  margin-left: 3px;
}

.show {
  display: block;
}

.centered {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.centered > div {
  width: 100%;
  box-sizing: border-box;
}

.buttons-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 5px;
}
</style>
