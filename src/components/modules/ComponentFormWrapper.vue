<template>
  <component :is="formLayout">
    <template #title>{{ title }}</template>
    <template #subTitle>{{ subTitle }}</template>
    <template #formInfo>
      <slot name="formInfo" />
    </template>

    <template #header-actions>
      <v-btn icon="settings" variant="text" style="margin-left: auto" @click="settingsVisible = !settingsVisible" />
    </template>

    <v-form class="form-wrapper" @submit.prevent="$emit('submit')">
      <transition name="slide-left" mode="out-in">
        <v-container class="form-content" :key="currentStep">
          <slot v-if="hasSlot('buttons') && hasSlot('form')" name="form" />
          <p v-else>
            Não foi possível carregar os dados do formulário.
          </p>
        </v-container>
      </transition>
      <v-container class="form-actions">
        <slot v-if="hasSlot('buttons') && hasSlot('form')" name="buttons" />
        <v-btn v-else text="Voltar" @click="$router.back()" />
      </v-container>
    </v-form>
  </component>

  <component-dialog :component="DialogSettings" fullscreen title="Configurações" v-model:is-visible="settingsVisible" />
  <CLoading v-if="loading" :full="true" />
</template>

<script setup lang="ts">
import { useSlots, ref, shallowRef } from 'vue'
import LayoutPageForm from '@/layouts/LayoutPageForm.vue'
import DialogSettings from '../dialogs/DialogSettings.vue'
const props = defineProps({
  title: String,
  subTitle: String,
  currentStep: Number,
  loading: Boolean,
  layoutComponent: Object,
})
defineEmits(['submit'])
const slots = useSlots()
const settingsVisible = ref(false)
const formLayout = ref(shallowRef(props.layoutComponent ?? LayoutPageForm))

function hasSlot(name) {
  return !!slots[name]
}
</script>

<style>
.form-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-x: hidden;
}

.form-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  overflow-y: auto;
  height: 100%;
}

.form-actions {
  display: flex;
  width: 100%;
  position: sticky;
  bottom: 0;
  padding-top: 1rem;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}
</style>
