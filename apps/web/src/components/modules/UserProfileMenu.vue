<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { http } from "@/utils/index.ts";
import { useUserStore } from "@/stores";
import DialogSettings from "@/components/modules/DialogSettings.vue";
// Importe o seu componente auxiliar aqui (ajuste o caminho se necessário)
import ContextMenu from "@/components/ui/ContextMenu.vue";

const router = useRouter();
const user = useUserStore();

const logoutLoading = ref(false);
const logoutDialog = ref(false);
const settingsDialog = ref(false);

// 1. Mapeamos os botões no formato que o seu componente auxiliar espera
const menuItems = computed(() => [
  {
    text: "Meu perfil",
    value: "profile",
    icon: "account_circle"
  },
  {
    text: "Configurações",
    value: "settings",
    icon: "settings"
  },
  {
    text: "Sair da conta",
    value: "logout",
    icon: "logout"
  }
]);

// 2. Centralizamos o disparo das ações com base no 'value' retornado pelo @select
function handleMenuSelect(item: any) {
  if (item.value === "profile") {
    router.push({ name: 'UserProfile', params: { username: user.username } });
  } else if (item.value === "settings") {
    settingsDialog.value = true;
  } else if (item.value === "logout") {
    logoutDialog.value = true;
  }
}

async function handleLogout() {
  logoutLoading.value = true;
  try {
    await http.auth.logout();
  } finally {
    logoutLoading.value = false;
    logoutDialog.value = false;
  }
}
</script>

<template>
  <div class="d-inline-flex">
    <v-menu
      min-width="260"
      rounded="xl"
      transition="slide-y-transition"
      offset="8"
    >
      <template #activator="{ props }">
        <slot name="activator" v-bind="{ props }">
          <v-avatar
            v-bind="props"
            size="36"
            color="primary"
            class="cursor-pointer hover-avatar-glow"
          >
            <v-img :src="user.profilePicture"></v-img>
          </v-avatar>
        </slot>
      </template>

      <v-card class="premium-menu-card pa-1" elevation="16" color="surface">
        <!-- Header com dados do usuário -->
        <div class="px-4 py-3 d-flex align-center ga-3 user-header-block rounded-t-xl">
          <v-avatar size="44" color="primary">
            <v-img :src="user.profilePicture"></v-img>
          </v-avatar>
          <div class="d-flex flex-column text-left overflow-hidden">
            <span class="text-subtitle-2 font-weight-bold text-truncate text-high-emphasis">
              {{ user.name || user.username }}
            </span>
            <span class="text-caption text-truncate text-medium-emphasis">
              @{{ user.username }}
            </span>
          </div>
        </div>

        <v-divider class="my-1 opacity-40" />

        <!-- 3. Seu componente auxiliar substitui o v-list antigo -->
        <ContextMenu
          :items="menuItems"
          :is-visible="true"
          class="px-1 bg-transparent dynamic-menu-list"
          @select="handleMenuSelect"
        />
      </v-card>
    </v-menu>

    <!-- Overlays permanecem idênticos -->
    <COverlay
      v-model="logoutDialog"
      title="Sair da conta"
      icon="logout"
      max-width="400"
      glass
    >
      Você deseja encerrar sua sessão atual?
      <template #actions>
        <v-spacer />
        <v-btn variant="text" rounded="pill" :disabled="logoutLoading" @click="logoutDialog = false">Cancelar</v-btn>
        <v-btn color="error" variant="flat" rounded="pill" :loading="logoutLoading" @click="handleLogout">Sair</v-btn>
      </template>
    </COverlay>

    <COverlay
      v-model="settingsDialog"
      type="fullscreen"
      title="Configurações"
      body-class="pa-0"
      :divider="false"
    >
      <dialog-settings />
      <template #actions>
        <v-spacer />
        <v-btn text="Fechar" @click="settingsDialog = false"></v-btn>
      </template>
    </COverlay>
  </div>
</template>

<style scoped>
.hover-avatar-glow {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.hover-avatar-glow:hover {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.4);
  transform: scale(1.05);
}

.premium-menu-card {
  background: rgba(var(--v-theme-surface), 0.85) !important;
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08) !important;
}

.user-header-block {
  background: rgba(var(--v-theme-on-surface), 0.02);
}

/*
  Aplicamos os mesmos estilos visuais que você tinha antes para interagir
  com os v-list-item gerados dentro do seu componente auxiliar
*/
.dynamic-menu-list :deep(.v-list-item) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: rgba(var(--v-theme-on-surface), 0.8) !important;
  border-radius: 8px !important;
  margin-bottom: 4px;
}

.dynamic-menu-list :deep(.v-list-item:hover) {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
  color: rgb(var(--v-theme-primary)) !important;
  transform: translateX(3px);
}

/* Identifica o último item (Sair) para aplicar a cor vermelha de erro */
.dynamic-menu-list :deep(.v-list-item:last-child:hover) {
  background-color: rgba(var(--v-theme-error), 0.08) !important;
  color: rgb(var(--v-theme-error)) !important;
}
</style>
