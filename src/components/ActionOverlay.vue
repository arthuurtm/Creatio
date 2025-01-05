<template>
  <div id="overlay" class="overlay" :class="overlayModalClass" v-if="isOverlayVisible" @click="overlayModal">
    <div class="modal">
      <div clas="oTitle">
        <h3>{{ modalTitle }}</h3>
      </div>
      <div class="oContent">
        <p style="margin: 3px">{{ modalMessage }}</p>
        <div class="modal-buttons">
          <!-- Adicionando as classes dinamicamente aos botões -->
          <button id="btn1" :class="btn1Class" @click="btn1Action">{{ btn1Txt }}</button>
          <button id="btn2" :class="btn2Class" @click="btn2Action">{{ btn2Txt }}</button>
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
      btn1Txt: 'Confirmar',
      btn2Txt: 'Cancelar',
      btn1Action: null,
      btn2Action: null,
      overlayModalClass: '',
      btn1Class: '',
      btn2Class: ''
    };
  },
  methods: {
    openModal({ message, title, action }) {
      console.log(`OpenModal() > ${message}; ${title}; ${action}`);
      this.modalTitle = title || 'Confirmação';
      this.modalMessage = message || 'Você tem certeza que deseja realizar esta ação?';

      this.btn2Action = () => {
        this.hideModal();
      };

      if (action === 'logout') {
        this.btn1Txt = 'Confirmar';
        this.btn2Txt = 'Cancelar';
        this.btn1Class = 'btn destructive';
        this.btn2Class = 'btn confirm';
        this.btn1Action = () => { this.hideModal(); window.location.href = '/auth/logout';};
        this.btn2Action = () => { this.hideModal(); return false;};

      } else if (action === 'delete') {
        this.btn1Txt = 'Deletar';
        this.btn2Txt = 'Cancelar';
        this.btn1Class = 'btn destructive';
        this.btn2Class = 'btn confirm';
        this.btn1Action = () => {
          console.log('Entrada deletada');
          this.hideModal();
        };

      } else if (action === 'save') {
        this.btn1Txt = 'Salvar';
        this.btn2Txt = 'Cancelar';
        this.btn1Class = 'btn';
        this.btn2Class = 'btn';
        this.btn1Action = () => {
          console.log('Alterações salvas');
          this.hideModal();
        };

      } else if (action === 'okOnly') {
        this.btn1Txt = 'Ok';
        this.btn1Class = 'btn confirm';
        this.btn2Class = '';
        this.btn1Action = () => {
          console.log('Confirmado');
          this.hideModal();
        };
      } else if (action === 'noYes') {
        this.btn1Txt = 'Não';
        this.btn2Txt = 'Sim';
        this.btn1Class = 'btn cancel';
        this.btn2Class = 'btn confirm';
        this.btn1Action = () => {this.hideModal(); return false;};
        this.btn2Action = () => {this.hideModal(); return true;};
      }

      this.isOverlayVisible = true; // Torna o componente overlay visível
      this.overlayModalClass = 'active';
    },
    hideModal() {
      this.overlayModalClass = '';
      this.isOverlayVisible = false;
    },
    overlayModal() {
      // Lógica para lidar com o clique no overlay
    }
  },
};
</script>

<style scoped>
  @import url('/src/assets/css/modules/actionOverlay.css');
</style>
