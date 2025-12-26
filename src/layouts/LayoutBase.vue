<script setup>
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import ComponentNavigator from '@/components/modules/ComponentHeader.vue'
  import { http } from '@/functions/'
  import { useUserStore } from '@/stores'

  const route = useRoute()
  const router = useRouter()
  const user = useUserStore()
  const pageMeta = computed(() => route?.meta)
  const isAuthenticated = computed(() => user.getIsAuth)
  const contextMenuRef = ref(null)
  const dialogData = ref(null)
  const isDialogVisible = ref(false)

  function handleDialogMessageEvent (e) {
    if (e?.action) {
      e.action()
    }
    isDialogVisible.value = !isDialogVisible.value
  }

  function handleLogout () {
    isDialogVisible.value = true
    dialogData.value = {
      title: 'Sair',
      message: 'Você quer mesmo sair?',
      buttons: [{ text: 'Não' }, { text: 'Sim', class: 'confirm', action: () => http.auth.logout() }],
    }
  }

  function openMoreOptions (event) {
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
            { text: 'Configurações', icon: 'settings' },
            { text: 'Sair', icon: 'logout', action: handleLogout },
          ],
        },
      ],
      event,
    )
  }

  const navLinks = computed(() => {
    return {
      left: [
        { text: 'HOME', action: () => router.push({ name: 'Home' }) },
        { text: 'JOGOS', action: () => router.push({ name: 'GamesView' }) },
        { text: 'PROJETOS', action: () => router.push({ name: 'CreateHome' }) },
        { text: 'SOBRE', action: () => router.push({ name: 'About' }) },
      ],
      right: [
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
          action: e => openMoreOptions(e),
          hidden: !isAuthenticated.value,
        },
      ],
    }
  })
</script>

<template>
  <v-main>
    <ComponentNavigator :hidden="pageMeta.hiddenNavigator" :nav-links="navLinks" />
    <div
      class="app-content"
      :class="[pageMeta.hiddenNavigator && 'overlay-nav', pageMeta.fullscreen && 'full']"
    >
      <router-view v-slot="{ Component }">
        <transition mode="out-in" name="fastFade">
          <CGroup :key="Component" grow>
            <component :is="Component" />
          </CGroup>
        </transition>
      </router-view>
    </div>
    <CContextMenu ref="contextMenuRef" />
    <ComponentDialog v-model:is-visible="isDialogVisible" :title="dialogData?.title">
      <DialogMessage :dialog-data="dialogData" @click="handleDialogMessageEvent" />
    </ComponentDialog>
  </v-main>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
  flex-direction: column;
}

.app-header {
  height: auto;
}

.app-content {
  display: flex;
  overflow: auto;
  padding: 0.5rem;
  z-index: 1;
  height: 100%;
}

.app-content.full {
  padding: 0;
}

.app-navigator {
  display: grid;
  position: sticky;
  grid-column: 1;
  z-index: 2;
}

/* --- MODO MENU ESCONDIDO (QUANDO hidden é ativo) --- */
.app-content.overlay-nav {
  grid-template-columns: 1fr;
  position: relative;
}

@media (max-width: 600px) {
  .app-container {
    grid-template-rows: 1fr auto;
  }

  .app-header {
    grid-row: 2;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    max-height: 70px;
    padding: 8px 16px;
    border-radius: 24px;
  }

  .app-content {
    grid-row: 1;
    z-index: 1;
  }

  .app-view {
    margin: 0;
    border-radius: 0 !important;
    padding: 5px;
    border-left: none;
  }
}
</style>
