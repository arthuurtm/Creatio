<script setup>
import ComponentCreateGamePage from '@/components/ComponentGamePage.vue'
</script>

<template>
  <ComponentCreateGamePage>
    <div class="page-wrapper">
      <div class="checkerboard"></div>

      <div class="main-floating-options">
        <div class="main-options">
          <CreateButton
            :buttons="[
              {
                icon: 'add_circle',
                class: 'symbolic no-padding no-scalling',
                id: 'create-game-button',
              },
            ]"
          />
        </div>
      </div>
    </div>
  </ComponentCreateGamePage>
</template>

<style scoped>
.page-wrapper {
  position: relative;
  width: 100%;
  height: 100%; /* Garante altura da tela */
  overflow: hidden;
  background: var(--bg);
}

/* Fundo tipo caderno */
.checkerboard {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(to right, var(--border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border) 1px, transparent 1px);
  background-size: 20px 20px;
  z-index: 0;
}

/* Botões visíveis */
.main-floating-options {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  background: var(--bg);
  border: 1px solid var(--border);
  padding: 0.5rem;
  border-radius: 8px;
}
</style>
