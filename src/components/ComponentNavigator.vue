<template>
  <div class="container" :class="[isMenuActive && 'active']">
    <a class="hide-nav" @click="updateMenuState(true)" v-if="defaultHideButton">
      <span class="material-symbols-outlined notranslate">{{ navigatorIcon }}</span>
    </a>

    <div
      class="nav"
      :class="[isMenuActive ? 'active' : 'minimized', hidden && 'hidden']"
      id="nav"
      ref="menu"
    >
      <div class="nav-content">
        <div
          class="invisible-drag-camp"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <div class="drag-handle" @click="updateMenuState()" @touchstart="onTouchStart"></div>
        </div>

        <div class="center">
          <ul>
            <CreateButton
              :rules="['noGroup']"
              :buttons="[
                {
                  tag: 'nav-li',
                  text: `@${user.getUsername}`,
                  img: {
                    src: user.getProfilePicture,
                    alt: 'Foto de perfil',
                    class: 'profile-picture',
                  },
                  class: `controller-index`,
                  id: 'user-info',
                  rules: [!isAuthenticated && 'hide'],
                },
                {
                  tag: 'nav-li',
                  text: 'Entrar',
                  icon: 'login',
                  class: `controller-index ${selectedPage === 'Login' && 'selected'}`,
                  action: () => navigateTo('Login'),
                  rules: [isAuthenticated && 'hide'],
                },
                {
                  tag: 'nav-li',
                  text: 'Início',
                  icon: 'home',
                  class: `controller-index ${selectedPage === 'Home' && 'selected'}`,
                  action: () => navigateTo('Home'),
                },
                {
                  tag: 'nav-li',
                  text: 'Criar',
                  icon: 'add_circle',
                  class: `controller-index ${selectedPage === 'Create' && 'selected'}`,
                  action: () => navigateTo('Create'),
                  rules: [!isAuthenticated && 'hide'],
                },
                {
                  tag: 'nav-li',
                  text: 'Conversas',
                  icon: 'chat',
                  class: `controller-index ${selectedPage === 'Chat' && 'selected'}`,
                  rules: [!isAuthenticated && 'hide'],
                },
                {
                  tag: 'nav-li',
                  text: 'Configurações',
                  icon: 'settings',
                  class: 'controller-index',
                  action: handleSettingsBox,
                },
                {
                  tag: 'nav-li',
                  text: 'Sair',
                  icon: 'logout',
                  class: `controller-index ${isAuthenticated ? '' : 'hidden'}`,
                  action: handleLogout,
                  rules: [!isAuthenticated && 'hide'],
                },
              ]"
            />
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/functions/auth'

// Stores e Router
const router = useRouter()
const store = inject('stores')
const user = store.user
const dialog = store.dialog

// Props e Emits
const props = defineProps({
  hidden: {
    type: Boolean,
    default: false,
  },
  page: {
    type: String,
    default: '',
  },
  defaultHideButton: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['navigateTo', 'navigatorStatus'])
defineExpose({ updateMenuState })
let touchTimeout = null

// Estado reativo
const isAuthenticated = computed(() => user.getIsAuth)
const menuRef = ref(null)
const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)
const isMenuActive = ref(true)
const navigatorIcon = ref('menu')
const selectedPage = computed(() => props.page)
const hidden = computed(() => props.hidden)

// Funções
const handleIsMobile = () => {
  return window.matchMedia('(max-width: 768px)').matches
}

const navigateTo = (page) => {
  console.log(`navigateTo() > page: ${page}`)
  router.push({ name: page })
  // selectedPage.value = page
  updateMenuState()
}

const handleLogout = () => {
  dialog.setDialog('DialogMessage', {
    title: 'Sair',
    message: 'Você quer mesmo sair?',
    btn1: { text: 'Não' },
    btn2: {
      text: 'Sim',
      class: 'confirm',
      action: () => {
        logout()
      },
    },
  })
}

const handleSettingsBox = () => {
  dialog.setDialog('DialogSettings', { title: 'Configurações' })
  // updateMenuState()
}

// Eventos de Toque
const onTouchStart = (event) => {
  startY.value = event.touches[0].clientY
  isDragging.value = false
  touchTimeout = setTimeout(() => {
    isDragging.value = true
  }, 150)
}

const onTouchMove = (event) => {
  event.stopPropagation()
  event.preventDefault()
  if (!isDragging.value) return

  currentY.value = event.touches[0].clientY
  const translateY = currentY.value - startY.value

  if (menuRef.value) {
    menuRef.value.style.transform = `translateY(${translateY}px)`
  }
}

const onTouchEnd = () => {
  if (!isDragging.value) return
  isDragging.value = false
  clearTimeout(touchTimeout)

  const deltaY = currentY.value - startY.value
  const activationThreshold = 50

  if (deltaY < -activationThreshold) {
    isMenuActive.value = true
  } else if (deltaY > activationThreshold) {
    isMenuActive.value = false
  }

  if (menuRef.value) {
    menuRef.value.style.transform = ''
  }
}

// Atualiza estado do menu
function updateMenuState(force = false) {
  const isMobile = handleIsMobile()
  if (isMobile || force) {
    isMenuActive.value = !isMenuActive.value
  }
  emit('navigatorStatus', isMenuActive.value)
}

// Watchers
watch(isMenuActive, (value) => {
  navigatorIcon.value = value ? 'menu_open' : 'menu'
})

// Montagem do Componente
onMounted(() => {
  updateMenuState(!handleIsMobile())
})
</script>

<style scoped>
@import '/src/assets/css/components/c-navigator.css';
</style>
