<script setup>
import ComponentNavigator from '@/components/ComponentNavigator.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  hiddenNavigator: Boolean,
})

const ComputedHiddenNavigator = computed(() => useRoute().meta.hiddenNavigator ?? props.hiddenNavigator)
</script>

<template>
  <div class="app-container">

    <ComponentNavigator :hidden="ComputedHiddenNavigator" />

    <div class="view-app">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>

  </div>
</template>

<style scoped>
@import url('/src/assets/css/layouts/l-appMain.css');
</style>
