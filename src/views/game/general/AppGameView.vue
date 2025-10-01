<template>
  <LayoutBase
    :showHeader="false"
    :navigatorDefaultHidden="true"
    :fullscreen="useRoute()?.meta?.fullscreen"
  />
</template>

<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue'
import { useRoute } from 'vue-router'
</script>
