<template>
    <div id="app">
      <button @click="toggleSlide">Toggle Slide</button>
  
      <!-- A transição será aplicada ao elemento com a classe "slidable" -->
      <transition name="slide-right">
        <div v-if="isVisible">
          <h2>Conteúdo deslizante</h2>
          <p>Esse conteúdo vai deslizar para a esquerda quando você clicar no botão.</p>
        </div>
      </transition>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isVisible: false, // Controla se o conteúdo está visível ou não
      };
    },
    methods: {
      toggleSlide() {
        this.isVisible = !this.isVisible;
      },
    },
  };
  </script>
  
  <style scoped>
/* Para a transição de entrada */
.slide-right-enter-from {
  transform: translateX(100%);  /* Começa fora da tela à direita */
}
.slide-right-enter-to {
  transform: translateX(0);  /* Termina no lugar correto */
  transition: transform 0.5s ease;  /* Define a animação */
}

/* Para a transição de saída */
.slide-right-leave-to {
  transform: translateX(100%);  /* Sai para a direita */
  transition: transform 0.5s ease;  /* Define a animação */
}
  </style>
  