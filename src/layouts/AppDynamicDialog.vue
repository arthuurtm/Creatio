<script setup>
import { useAppDynamicDialog } from "@/stores/store";
import { onMounted, ref } from 'vue';
const props = defineProps({
  component: String,
  title: String
});
function close() {
  useAppDynamicDialog().close()
};

// const isOpen = ref(false);
// const dialogRef = ref(null);

let dialogStyle = 'default';
if (props.component === 'DialogSettings') {
  dialogStyle = 'menu';
}

// onMounted(() => {
//   window.addEventListener('keydown', close());
// });

// onMounted(async () => {
//   await nextTick(); // Aguarda Vue renderizar o componente dinâmico
//   if (dialogRef.value) {
//     const contentHeight = dialogRef.value.scrollHeight;
//     dialogRef.value.style.height = "0px"; // Começa fechado

//     setTimeout(() => {
//       dialogRef.value.style.height = contentHeight + "px"; // Expande com animação
//     }, 10);
//   }

//   isOpen.value = true;
// });

</script>

<template>
  <div class="dialog-shadow">
    <transition name="moveToCenter">
      <div v-if="props.component" class="dialog-main" :id="[
        dialogStyle === 'menu' && 'menuStyle'
      ]
        " ref="dialogRef">
        <div class="title-bar">
          <div class="options">
            <div class="title">
              <p>{{ props.title }}</p>
            </div>
            <div>
              <button id="close" @click="close"><span
                  class="material-symbols-outlined notranslate">close</span></button>
            </div>
          </div>
        </div>
        <div class="content">
          <component :is="props.component" @close="close" />
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
@import url('/src/assets/css/components/c-dynamicDialog.css');
</style>
