// plugins/settingsBox.js
import { createApp } from 'vue';
import SettingsBox from '@/components/SettingsBox.vue';

export default {
  install(app) {
    // Cria uma instância do componente DialogBox
    const overlayInstance = createApp(SettingsBox).mount(document.createElement('div'));

    // Aguarda o DOM estar carregado para adicionar ao documento
    document.addEventListener('DOMContentLoaded', () => {
      const appElement = document.getElementById('app');
      appElement.appendChild(overlayInstance.$el);
    });

    // Configura propriedades globais para controle do overlay
    app.config.globalProperties.$settingsBox = {
      show() {
        overlayInstance.show();
      },
      hide() {
        overlayInstance.close();
      },
    };
  },
};