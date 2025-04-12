<script setup>
import { useAppDynamicDialog } from '@/stores/store'
import { computed, ref, watch } from 'vue'
const props = defineProps({
  component: String,
  title: String,
})

const show = ref(false)

function close() {
  show.value = false
  setTimeout(() => {
    useAppDynamicDialog().close()
  }, 300)
}

let dialogStyle = 'default'
if (props.component === 'DialogSettings') {
  dialogStyle = 'menu'
}

const isVisible = computed(() => useAppDynamicDialog().isVisible)
const showDialog = computed(() => isVisible.value || show.value)

watch(isVisible, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      show.value = true
    }, 100)
  }
})

// onMounted(() => {
//   window.addEventListener('keydown', close());
// });
</script>

<template>
  <div class="dialog-shadow" v-show="showDialog">
    <transition name="moveToCenter" mode="out-in" :key="props.component">
      <div
        v-if="props.component"
        class="dialog-main"
        :id="[dialogStyle === 'menu' && 'menuStyle']"
        ref="dialogRef"
        :class="[show && 'active']"
      >
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
          <component :is="props.component" :key="props.component" @close="close" />
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
@import url('/src/assets/css/components/c-dynamicDialog.css');
</style>
