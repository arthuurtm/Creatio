<template>
  <div
    v-if="isVisible"
    class="focusDialogElement"
    :class="overlayClass"
    @click="handleOverlayClick"
  >
    <div class="modal" @click.stop>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="modal-buttons">
        <button :class="btn1Class" @click="handleBtn1">{{ btn1Txt }}</button>
        <button v-if="btn2Txt" :class="btn2Class" @click="handleBtn2">
          {{ btn2Txt }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isVisible: false,
      title: '',
      message: '',
      btn1Txt: 'Confirmar',
      btn2Txt: 'Cancelar',
      btn1Action: null,
      btn2Action: null,
      overlayClass: '',
      btn1Class: '',
      btn2Class: '',
    };
  },
  methods: {
    show({ title, message, btn1, btn2 }) {
      this.title = title || 'Confirmação';
      this.message = message || 'Você tem certeza desta ação?';
      this.btn1Txt = btn1?.text || 'Ok';
      this.btn1Class = btn1?.class || 'btn confirm';
      this.btn1Action = btn1?.action || this.hide;
      this.btn2Txt = btn2?.text || '';
      this.btn2Class = btn2?.class || 'btn cancel';
      this.btn2Action = btn2?.action || this.hide;
      this.isVisible = true;
    },
    hide() {
      this.isVisible = false;
    },
    handleBtn1() {
      if (this.btn1Action) this.btn1Action();
      this.hide();
    },
    handleBtn2() {
      if (this.btn2Action) this.btn2Action();
      this.hide();
    },
    handleOverlayClick() {
      this.hide();
    },
  },
};
</script>

<style scoped>
  @import url('/src/assets/css/modules/dialogBox.css');
</style>
