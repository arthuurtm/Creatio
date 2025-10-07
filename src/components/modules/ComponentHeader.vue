<template>
  <Transition name="slide-top">
    <div class="header-container" v-if="!hidden">
      <header class="header" id="header">
        <div class="header-left">
          <CreateLogo
            :style="['font-size: 2.5rem', 'cursor: pointer']"
            @click="navigateTo('Home')"
          />
          <nav class="main-nav">
            <a
              v-for="link in navLinks"
              :key="link.routeName"
              class="nav-link"
              :class="{ active: selectedPage === link.routeName }"
              @click="navigateTo(link.routeName)"
            >
              {{ link.text }}
            </a>
          </nav>
        </div>

        <div class="header-right">
          <CreateButton
            v-for="(button, index) in uiButtons.right"
            :key="index"
            :buttons="[
              {
                ...button,
                class: [
                  ...(Array.isArray(button.class) ? button.class : [button.class]),
                  'symbolic',
                ],
              },
            ]"
          />
        </div>
      </header>
    </div>
  </Transition>
  <CreateContextMenu ref="contextMenuRef" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { http } from '@/functions/'
import DialogMessage from '@/components/dialogs/DialogMessage.vue'
import DialogSettings from '@/components/dialogs/DialogSettings.vue'
import { useUserStore, useAppDynamicDialog } from '@/stores'

// Lembre-se de importar seus componentes CreateLogo e CreateButton se ainda não forem globais
// import CreateLogo from '@/components/CreateLogo.vue'
// import CreateButton from '@/components/CreateButton.vue'
// import CreateContextMenu from '@/components/CreateContextMenu.vue'

// Stores e Router
const router = useRouter()
const user = useUserStore()
const dialog = useAppDynamicDialog()
const contextMenuRef = ref(null)

// Props
const props = defineProps({
  hidden: {
    type: Boolean,
    default: false,
  },
  page: {
    type: String,
    default: '',
  },
})

// Estado Reativo
const isAuthenticated = computed(() => user.getIsAuth)
const selectedPage = computed(() => props.page)

// --- NOVO: Links de Navegação Principal ---
const navLinks = ref([
  { text: 'HOME', routeName: 'Home' },
  { text: 'JOGOS', routeName: 'Games' }, // Exemplo, use os nomes das suas rotas
  { text: 'PROJETOS', routeName: 'CreateHome' }, // Reutilizando a rota que já existia
  { text: 'SOBRE', routeName: 'About' }, // Exemplo
])

// Funções
const navigateTo = (routeName) => {
  if (routeName) {
    router.push({ name: routeName })
  }
}

const handleLogout = () => {
  dialog.setDialog(DialogMessage, {
    title: 'Sair',
    message: 'Você quer mesmo sair?',
    buttons: [{ text: 'Não' }, { text: 'Sim', class: 'confirm', action: () => http.auth.logout() }],
  })
}

const handleSettingsBox = () => {
  dialog.setDialog(DialogSettings, { title: 'Configurações' })
}

const openMoreOptions = (event) => {
  event.preventDefault()
  contextMenuRef.value.openContextMenu(
    [
      {
        items: [
          { text: 'Meu Perfil', icon: 'account_circle', action: () => navigateTo('UserProfile') },
        ],
      },
      {
        items: [
          { text: 'Configurações', icon: 'settings', action: handleSettingsBox },
          { text: 'Sair', icon: 'logout', class: 'confirm', action: handleLogout },
        ],
      },
    ],
    event,
  )
}

// Botões da UI (agora apenas para a direita)
const uiButtons = computed(() => ({
  right: [
    // O botão de "inventory_2" foi movido para os navLinks como "PROJETOS"
    {
      icon: 'inbox',
      text: 'Notificações', // Adicionar texto para acessibilidade é uma boa prática
      action: null, // Adicionar ação para notificações
      rules: [!isAuthenticated.value && 'hide'],
    },
    {
      img: {
        src: user.getProfilePicture,
        alt: 'Foto de perfil',
        class: 'profile-picture',
      },
      id: 'user-info',
      action: openMoreOptions,
      rules: [!isAuthenticated.value && 'hide'],
    },
  ],
}))
</script>

<style scoped>
.header-container {
  width: 100%;
  background-color: var(--bg2);
  position: relative;
  /* padding: 0 1rem; */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1280px; /* Limita a largura para telas grandes, como a Steam faz */
  margin: 0 auto;
  height: 80px; /* Altura fixa para o header */
  transition:
    transform 0.3s ease,
    visibility 0.3s ease;
}

.header-container.hidden .header {
  visibility: hidden;
  transform: translateY(-100%);
}

/* --- SEÇÃO ESQUERDA --- */
.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

/* --- NAVEGAÇÃO PRINCIPAL --- */
.main-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  height: 100%;
}

.nav-link {
  color: var(--steam-text);
  text-transform: uppercase;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: color 0.2s ease-in-out;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent; /* Espaço para o highlight */
}

.nav-link:hover {
  color: var(--text);
}

.nav-link.active {
  color: var(--text);
  border-bottom-color: var(--text);
}

/* --- SEÇÃO DIREITA --- */
.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

:deep(.profile-picture) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  object-fit: cover;
}
</style>
