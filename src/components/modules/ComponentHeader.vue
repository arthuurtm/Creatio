<template>
  <v-app-bar
    v-if="!hidden"
    border="b"
    class="px-4"
    elevation="0"
    height="80"
  >
    <v-container class="d-flex align-center pa-0" style="max-width: 1280px">

      <div class="d-flex align-center gap-4">
        <CLogo style="cursor: pointer" @click="router.push({ name: 'Home' })" />

        <template v-if="title">
          <span class="mx-4 text-grey">x</span>
          <span class="text-h6 font-weight-bold">{{ title }}</span>
        </template>
      </div>

      <v-divider class="mx-4" inset vertical />

      <nav class="d-flex gap-4">
        <CButton
          v-for="(btn, index) in finalNavLinks.left"
          :key="index"
          v-bind="btn"
          @click="btn.action?.()"
        />
      </nav>

      <v-spacer /> <div class="d-flex gap-6">
        <CButton
          v-for="(btn, index) in finalNavLinks.right"
          :key="'right-' + index"
          v-bind="btn"
          @click="btn?.action"
        />
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup>
  import { computed } from 'vue'
  import router from '@/router'

  // Props
  const props = defineProps({
    hidden: {
      type: Boolean,
      default: false,
    },
    navLinks: {
      type: Object,
      default: () => ({ left: [], right: [] }),
    },
    title: String,
  })

  const finalNavLinks = computed(() => {
    return {
      left: props.navLinks?.left,
      right: [...(props.navLinks && Array.isArray(props.navLinks.right) ? props.navLinks.right : [])],
    }
  })
</script>

<style scoped>
.header-container {
  width: 100%;
  background-color: var(--bg2);
  position: relative;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1280px; /* Limita a largura para telas grandes, como a Steam faz */
  margin: 0 auto;
  height: 80px; /* Altura fixa para o header */
  transition:
    transform 0.3s ease,
    visibility 0.3s ease;
}

.header-container.hidden .header {
  visibility: hidden;
  transform: translateY(-100%);
}

.header-info {
  display: flex;
  gap: 1rem;
}

.separator {
  width: 1px;
  height: -webkit-fill-available;
  background: var(--border);
  margin: 0 1rem;
}

/* --- SEÇÃO ESQUERDA --- */
.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

/* --- NAVEGAÇÃO PRINCIPAL --- */
.main-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  height: 100%;
}

/* --- SEÇÃO DIREITA --- */
.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
