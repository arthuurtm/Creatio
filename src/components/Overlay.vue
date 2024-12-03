<template>
  <div id="overlay" class="overlay" :class="overlayModalClass" v-if="isOverlayVisible" @click="overlayModal">
    <div class="modal">
      <div class="oTitle">
        <h3>{{ modalTitle }}</h3>
      </div>
      <div class="oContent">
        <p style="margin: 3px">{{ modalMessage }}</p>
        <div class="modal-buttons">
          <!-- Adicionando as classes dinamicamente aos botões -->
          <button id="confirm" :class="confirmButtonClass" @click="cancelAction">{{ cancelText }}</button>
          <button id="cancel" :class="cancelButtonClass" @click="confirmAction">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isOverlayVisible: false,
      modalTitle: '',
      modalMessage: '',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      confirmAction: null,
      cancelAction: null,
      overlayModalClass: '',
    };
  },
  methods: {
    openModal({ message, title, action }) {
      console.log(`OpenModal() > ${message}; ${title}; ${action}`);
      this.modalTitle = title || 'Confirmação';
      this.modalMessage = message || 'Você tem certeza que deseja realizar esta ação?';

      this.cancelAction = () => {
        this.hideModal();
      };

      if (action === 'logout') {
        this.confirmText = 'Confirmar';
        this.cancelText = 'Cancelar';
        this.confirmButtonClass = 'btn-destructive';
        this.cancelButtonClass = 'btn';
        this.confirmAction = () => {
          console.log('Usuário deslogado');
          this.hideModal();
          window.location.href = '/auth/logout';
        };

      } else if (action === 'delete') {
        this.confirmText = 'Deletar';
        this.cancelText = 'Cancelar';
        this.confirmButtonClass = 'btn';
        this.cancelButtonClass = 'btn';
        this.confirmAction = () => {
          console.log('Entrada deletada');
          this.hideModal();
        };

      } else if (action === 'save') {
        this.confirmText = 'Salvar';
        this.cancelText = 'Cancelar';
        this.confirmButtonClass = 'btn';
        this.cancelButtonClass = 'btn';
        this.confirmAction = () => {
          console.log('Alterações salvas');
          this.hideModal();
        };

      } else if (action === 'okOnly') {
        this.confirmText = 'Ok';
        this.confirmButtonClass = 'btn';
        this.cancelButtonClass = '';
        this.confirmAction = () => {
          console.log('Confirmado');
          this.hideModal();
        };
      }

      this.isOverlayVisible = true; // Torna o componente overlay visível
      this.overlayModalClass = 'active';
    },
    hideModal() {
      this.overlayModalClass = '';
      this.isOverlayVisible = false;
    }
  },
};
</script>

<style scoped>
  @import url('/src/assets/css/modules/overlay.css');
</style>
