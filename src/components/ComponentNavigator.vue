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
            <li v-if="isAuthenticated" id="user-info" class="user-info controller-index">
              <img :src="profilePicture" alt="Foto de perfil" class="profile-picture" />
              <p class="nickname">@{{ user.getUsername }}</p>
            </li>

            <li
              v-if="!isAuthenticated"
              @click="navigateTo('Login')"
              :class="[selectedPage === 'Login' && 'selected']"
              class="controller-index"
            >
              <span class="material-symbols-outlined notranslate">login</span>
              <p>Entrar</p>
            </li>

            <li
              @click="navigateTo('Home')"
              :class="[selectedPage === 'Home' && 'selected']"
              class="controller-index"
            >
              <span class="material-symbols-outlined notranslate">home</span>
              <p>Início</p>
            </li>

            <li
              v-if="isAuthenticated"
              @click="navigateTo('Create')"
              :class="[selectedPage === 'Create' && 'selected']"
              class="controller-index"
            >
              <span class="material-symbols-outlined notranslate">add_circle</span>
              <p>Criar</p>
            </li>

            <li
              v-if="isAuthenticated"
              @click="navigateTo('Chat')"
              :class="[selectedPage === 'Chat' && 'selected']"
              class="controller-index"
            >
              <span class="material-symbols-outlined notranslate">chat</span>
              <p>Conversas</p>
            </li>

            <li @click="handleSettingsBox" class="controller-index">
              <span class="material-symbols-outlined notranslate">settings</span>
              <p>Configurações</p>
            </li>

            <li
              v-if="isAuthenticated"
              @click="handleLogout"
              id="logoutMenuButton"
              class="controller-index"
            >
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
const profilePicture = computed(() => {
  return user.getProfilePicture
})
const navigatorIcon = ref('menu')
const selectedPage = ref(props.page)
const hidden = computed(() => props.hidden)

// Funções
const handleIsMobile = () => {
  return window.matchMedia('(max-width: 768px)').matches
}

const navigateTo = (page) => {
  console.log(`navigateTo() > page: ${page}`)
  router.push({ name: page })
  selectedPage.value = page
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
