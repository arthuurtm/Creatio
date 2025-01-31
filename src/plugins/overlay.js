// plugins/overlay.js
import { createApp } from 'vue';
import ActionOverlay from '@/components/ActionOverlay.vue';

export default {
  install(app) {
    // Cria uma instância do componente ActionOverlay
    const overlayInstance = createApp(ActionOverlay).mount(document.createElement('div'));

    // Aguarda o DOM estar carregado para adicionar ao documento
    document.addEventListener('DOMContentLoaded', () => {
      const appElement = document.getElementById('app');
      appElement.appendChild(overlayInstance.$el);
    });

    // Configura propriedades globais para controle do overlay
    app.config.globalProperties.$overlay = {
      show(params) {
        overlayInstance.show(params);
      },
      hide() {
        overlayInstance.hide();
      },
    };
  },
};