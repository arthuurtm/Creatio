<script setup lang="ts">
import { useLoadingBar, useMessage, useNotification, useDialog } from 'naive-ui'
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const loadingBar = useLoadingBar()
const route = useRoute()

// Bind services to window for global access (stores, router, etc.)
;(window as any).$loadingBar = loadingBar
;(window as any).$message = useMessage()
;(window as any).$notification = useNotification()
;(window as any).$dialog = useDialog()

// Automatically trigger loading bar on route change
watch(() => route.path, () => {
  loadingBar.start()
  setTimeout(() => {
    loadingBar.finish()
  }, 200)
})
</script>

<template>
  <div style="display: none;"></div>
</template>
