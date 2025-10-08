<template>
  <Transition name="slide-top">
    <div class="header-container" v-if="!hidden">
      <header class="header" id="header">
        <div class="header-left">
          <div class="header-info">
            <CreateLogo
              :style="['font-size: 2.5rem', 'cursor: pointer']"
              @click="router.push({ name: 'Home' })"
            />
            <template v-if="title">
              <p>x</p>
              <p>
                <b>{{ title }}</b>
              </p>
            </template>
          </div>
          <div class="separator"></div>
          <nav class="main-nav">
            <CreateButton
              v-for="(button, index) in finalNavLinks.left"
              :key="'left-' + index"
              :buttons="[
                {
                  ...button,
                  class: [
                    ...(Array.isArray(button.class) ? button.class : [button.class]),
                    'symbolic upper',
                  ],
                },
              ]"
            />
          </nav>
        </div>

        <div class="header-right">
          <CreateButton
            v-for="(button, index) in finalNavLinks.right"
            :key="'right-' + index"
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
import { http } from '@/functions/'
import DialogMessage from '@/components/dialogs/DialogMessage.vue'
import DialogSettings from '@/components/dialogs/DialogSettings.vue'
import { useUserStore, useAppDynamicDialog } from '@/stores'
import router from '@/router'

// Stores e Router
const user = useUserStore()
const dialog = useAppDynamicDialog()
const contextMenuRef = ref(null)

// Props
const props = defineProps({
  hidden: {
    type: Boolean,
    default: false,
  },
  navLinks: {
    type: Object,
    default: () => ({ left: [], right: [] }),
  },
  title: String,
})

// Estado Reativo
const isAuthenticated = computed(() => user.getIsAuth)

// Funções
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
          {
            text: 'Meu Perfil',
            icon: 'account_circle',
            action: () => router.push({ name: 'UserProfile' }),
          },
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

const finalNavLinks = computed(() => {
  const defaultRightButtons = [
    {
      icon: 'inbox',
      text: 'Notificações',
      action: () => console.log('Abrir notificações'),
      hidden: !isAuthenticated.value,
    },
    {
      img: {
        src: user.getProfilePicture,
        alt: 'Foto de perfil',
        class: 'profile-picture',
      },
      id: 'user-info',
      action: openMoreOptions,
      hidden: !isAuthenticated.value,
    },
  ]

  return {
    left: props.navLinks?.left,
    right: [
      ...(props.navLinks && Array.isArray(props.navLinks.right) ? props.navLinks.right : []),
      ...defaultRightButtons.filter((btn) => !btn.hidden),
    ],
  }
})
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

.header-info {
  display: flex;
  gap: 1rem;
}

.separator {
  width: 1px;
  height: -webkit-fill-available;
  background: var(--border);
  margin: 0 1rem;
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

/* --- SEÇÃO DIREITA --- */
.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
