<template>
  <div class="container" :class="[isMenuActive && 'active']">

    <div class="hide-nav" @click="updateMenuState(true)">
      <span class="material-symbols-outlined notranslate">{{ navigatorIcon }}</span>
    </div>

    <div class="nav" :class="[isMenuActive ? 'active' : 'minimized', hidden ? 'hidden' : '']" id="nav" ref="menu">

      <div class="nav-content">
        <div class="invisible-drag-camp" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
          <div class="drag-handle" @click="updateMenuState()" @touchstart="onTouchStart"></div>
        </div>

        <div class="center">
          <ul>
            <li v-if="isAuthenticated" id="user-info">
              <span>
                <img :src="profilePicture" alt="Foto de perfil" class="profile-picture" />
              </span>
              <div>
                <p class="nickname">{{ userStore.name }}</p>
              </div>

            </li>

            <li v-if="!isAuthenticated" @click="navigateTo('Login')">
              <span class="material-symbols-outlined notranslate">login</span>
              <p>Entrar</p>
            </li>

            <li @click="navigateTo('Home')">
              <span class="material-symbols-outlined notranslate">home</span>
              <p>Início</p>
            </li>

            <li v-if="isAuthenticated" @click="navigateTo('Create')">
              <span class="material-symbols-outlined">add_circle</span>
              <p>Criar</p>
            </li>

            <li v-if="isAuthenticated" @click="navigateTo('Avatar')">
              <span class="material-symbols-outlined notranslate">person</span>
              <p>Personagens</p>
            </li>

            <li @click="handleSettingsBox">
              <span class="material-symbols-outlined notranslate">settings</span>
              <p>Configurações</p>
            </li>

            <li v-if="isAuthenticated" @click="handleLogout" id="logoutMenuButton">
              <span class="material-symbols-outlined notranslate">logout</span>
              <p>Sair</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { logout } from '@/functions/auth';
import { useAppDynamicDialog, useUserStore } from '@/stores/store'

// Stores e Router
const userStore = useUserStore();
const dynamicDialog = useAppDynamicDialog();
const router = useRouter();

// Props e Emits
defineProps({ hidden: Boolean });
const emit = defineEmits(['navigateTo']);
let touchTimeout = null;

// Estado reativo
const isAuthenticated = computed(() => userStore.isAuth);
const menuRef = ref(null);
const startY = ref(0);
const currentY = ref(0);
const isDragging = ref(false);
const isMenuActive = ref(false);
const profilePicture = computed(() => {
  return userStore.profilePicture;
});
const navigatorIcon = ref('menu');

// 🏗 Funções
const handleIsMobile = () => {
  return window.matchMedia("(max-width: 768px)").matches;
};

const navigateTo = (page) => {
  console.log(`navigateTo() > page: ${page}`);
  router.push({ name: page });
  updateMenuState();
};

const handleLogout = () => {
  dynamicDialog.setDialog('DialogMessage', {
    title: 'Sair',
    message: 'Você quer mesmo sair?',
    btn1: { text: 'Não', class: 'btn' },
    btn2: {
      text: 'Sim',
      class: 'btn confirm',
      action: () => {
        logout();
      },
    },
  });
  updateMenuState();
};

const handleSettingsBox = () => {
  dynamicDialog.setDialog('DialogSettings', { title: 'Configurações' });
  updateMenuState();
};

// 🖐 Eventos de Toque
const onTouchStart = (event) => {
  startY.value = event.touches[0].clientY;
  isDragging.value = false;
  touchTimeout = setTimeout(() => {
    isDragging.value = true;
  }, 150);
};

const onTouchMove = (event) => {
  event.stopPropagation();
  event.preventDefault();
  if (!isDragging.value) return;

  currentY.value = event.touches[0].clientY;
  const translateY = currentY.value - startY.value;

  if (menuRef.value) {
    menuRef.value.style.transform = `translateY(${translateY}px)`;
  }
};

const onTouchEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  clearTimeout(touchTimeout);

  const deltaY = currentY.value - startY.value;
  const activationThreshold = 50;

  if (deltaY < -activationThreshold) {
    isMenuActive.value = true;
  } else if (deltaY > activationThreshold) {
    isMenuActive.value = false;
  }

  if (menuRef.value) {
    menuRef.value.style.transform = '';
  }
};

// 📌 Atualiza estado do menu
function updateMenuState(force = false) {
  const isMobile = handleIsMobile();
  if (isMobile || force) {
    isMenuActive.value = !isMenuActive.value;
  }
};

// 🔎 Watchers
watch(isMenuActive, (value) => {
  navigatorIcon.value = value ? 'menu_open' : 'menu';
});

// 🏁 Montagem do Componente
onMounted(() => {
  updateMenuState(!handleIsMobile());
});
</script>

<style scoped>
@import "/src/assets/css/components/c-navigator.css";
</style>
