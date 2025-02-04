// plugins/overlay.js
import { createApp } from 'vue';
import DialogBox from '@/components/DialogBox.vue';

export default {
  install(app) {
    // Cria uma instância do componente DialogBox
    const overlayInstance = createApp(DialogBox).mount(document.createElement('div'));

    // Aguarda o DOM estar carregado para adicionar ao documento
    document.addEventListener('DOMContentLoaded', () => {
      const appElement = document.getElementById('app');
      appElement.appendChild(overlayInstance.$el);
    });

    // Configura propriedades globais para controle do overlay
    app.config.globalProperties.$dialogBox = {
      show(params) {
        overlayInstance.show(params);
      },
      hide() {
        overlayInstance.hide();
      },
    };
  },
};