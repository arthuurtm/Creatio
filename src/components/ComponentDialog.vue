<script setup>
import { computed, ref, watch, defineAsyncComponent, inject } from 'vue'
import CreateLoading from '@/components/elements/CreateLoading.vue'

const props = defineProps({
  component: String,
  title: String,
})

const show = ref(false)
const loading = ref(true)
const asyncComponent = ref(null)
const store = inject('stores')

function close() {
  show.value = false
  setTimeout(() => {
    store.dialog.close()
  }, 300)
}

let dialogStyle = 'default'

const isVisible = computed(() => store.dialog.getIsVisible)
const showDialog = computed(() => isVisible.value || show.value)

watch(isVisible, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      show.value = true
    }, 100)
  }
})

watch(
  () => props.component,
  async (newComponent) => {
    if (!newComponent) return

    loading.value = true

    asyncComponent.value = defineAsyncComponent({
      loader: () => import(`@/configs/dialogs/${newComponent}.vue`),
      timeout: 6000,
      loadingComponent: CreateLoading,
      onError(error, retry, fail, attempts) {
        if (attempts <= 3) retry()
        else fail()
      },
    })

    // opcional: esperar o componente carregar (se quiser esconder loader depois)
    try {
      await asyncComponent.value.__asyncLoader()
    } catch (err) {
      console.error('Erro ao carregar componente:', err)
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

// onMounted(() => {
//   window.addEventListener('keydown', close());
// });
</script>

<template>
  <div class="dialog-shadow" v-show="showDialog">
    <CreateLoading v-if="loading" />
    <div
      v-else
      class="dialog-main"
      :id="[dialogStyle === 'menu' && 'menuStyle']"
      ref="dialogRef"
      :class="[show && 'active', loading && 'loading']"
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
        <component :is="asyncComponent" :key="props.component" @close="close" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('/src/assets/css/components/c-dynamicDialog.css');
</style>
