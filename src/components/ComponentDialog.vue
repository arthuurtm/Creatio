<script setup>
import { computed, ref, watch, resolveDynamicComponent, inject } from 'vue'

const props = defineProps({
  component: String,
  title: String,
})

const asyncComponent = ref(null)
const store = inject('stores')

function close() {
  if (!store.dialog.getIsHistory) showDialogAnim.value = false
  setTimeout(() => {
    store.dialog.close()
  }, 300)
}

const showDialog = computed(() => store.dialog.getIsVisible)
const showDialogAnim = ref(false)

watch(showDialog, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      showDialogAnim.value = newValue
    }, 200)
  }
})

watch(
  () => props.component,
  async (newComponent) => {
    if (!newComponent) return

    const resolved = resolveDynamicComponent(newComponent)
    if (resolved) {
      asyncComponent.value = resolved
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="dialog-shadow" v-show="showDialog">
    <div class="dialog-main" :id="[]" :class="[showDialogAnim && 'active']">
      <div class="title-bar">
        <div class="options">
          <div class="title">
            <p>{{ props.title }}</p>
          </div>
          <div>
            <button id="close" @click="close">
              <span class="material-symbols-outlined notranslate">close</span>
            </button>
          </div>
        </div>
      </div>
      <div class="content">
        <transition name="fastFade" mode="out-in">
          <component :is="asyncComponent" :key="props.component" @close="close" />
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('/src/assets/css/components/c-dynamicDialog.css');
</style>
