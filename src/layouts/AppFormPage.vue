<template>
  <div class="page">
    <CreateButton
      :buttons="[
        {
          icon: 'settings',
          class: 'symbolic settings-button no-padding no-scalling',
          action: () => handleSettingsBox(),
          style: `
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          color: var(--form-sub);
          `,
        },
      ]"
    />

    <div class="main-form-container">
      <div class="left">
        <div id="logo">
          <CreateLogo />
        </div>
        <h1>{{ title }}</h1>
        <h4>{{ subTitle }}</h4>
        <slot name="formInfo" />
      </div>

      <div class="right">
        <form class="form-container centered" @submit.prevent="submitForm">
          <transition name="slide-left" mode="out-in">
            <div class="sepElements" :key="currentStep">
              <slot name="fields" />
            </div>
          </transition>

          <slot name="anchors" />
          <div class="sepButtons">
            <slot name="buttons" />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppDynamicDialog } from '@/stores'
import DialogSettings from '@/components/dialogs/DialogSettings.vue'

const dialog = useAppDynamicDialog()

defineProps({
  title: {
    type: String,
    default: 'Formulário',
  },
  subTitle: {
    type: String,
    default: '',
  },
  currentStep: {
    type: Number,
    default: 1,
  },
})

function handleSettingsBox() {
  dialog.setDialog(DialogSettings, { title: 'Configurações' })
}
</script>

<style scoped>
@import url('/src/assets/css/components/c-form.css');
</style>
