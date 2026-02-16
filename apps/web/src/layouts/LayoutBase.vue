<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores";
import { http } from "@/functions/index.ts";
import ComponentHeader from "@/components/modules/ComponentHeader.vue";
import CButton from "@/components/ui/CButton.vue";
import DialogSettings from "@/views/global/DialogSettings.vue";

const route = useRoute();
const router = useRouter();
const user = useUserStore();
const dialog = ref(false)
const collapsedHeader = ref(false);

watchEffect(() => {
  collapsedHeader.value = route.meta?.layout?.hideNavigator ?? false
})

</script>

<template>
  <v-app>
    <component-header :hidden="collapsedHeader">
      <template #left>
        <v-btn text="Início" @click="router.push({ name: 'Home' })" />
        <v-btn text="Seus Projetos" @click="router.push({ name: 'GameProjects' })" />
        <v-text-field placeholder="Pesquisar..." prepend-inner-icon="search" flat hide-details density="compact" />
      </template>
      <template #right>
        <!-- <v-btn icon="inbox" variant="text" v-if="isAuthenticated" /> -->
        <v-menu v-if="user.getIsAuth" location="bottom end">
          <template #activator="{ props }">
            <c-button v-bind="props" size="38" :icon="user.getProfilePicture" />
          </template>
          <v-list density="comfortable" min-width="200" class="pa-2 elevation-4">
            <v-list-item title="Meu perfil" prepend-icon="account_circle"
              @click="router.push({ name: 'UserProfile', params: { username: user.username } })" />
            <v-dialog
              fullscreen
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  title="Configurações"
                  prepend-icon="settings"
                />
              </template>

              <template #default="{ isActive }">
                <v-card rounded="false">
                  <v-toolbar title="Configurações" class="rounded-0" rounded="false" density="compact">
                    <v-spacer />
                    <v-btn icon="close" variant="text" @click="isActive.value = false"></v-btn>
                  </v-toolbar>

                  <v-card-text>
                    <dialog-settings />
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text="Fechar" @click="isActive.value = false"></v-btn>
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
            <v-divider class="my-2" />
            <v-list-item title="Sair" prepend-icon="logout" @click="dialog = true" />
          </v-list>
        </v-menu>
        <v-btn v-else variant="tonal" rounded="pill" color="primary" @click="router.push({ name: 'Login' })">
          Entrar
        </v-btn>
      </template>
    </component-header>

    <v-main>
      <router-view v-slot="{ Component }">
        <!-- <transition name="fastFade" mode="out-in"> -->
        <component :is="Component" />
        <!-- </transition> -->
      </router-view>
    </v-main>

    <v-dialog v-model="dialog" width="auto">
      <v-card max-width="400" prepend-icon="logout" title="Sair">
        <v-card-text>
          Você deseja encerrar sua sessão?
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="dialog = false, http.auth.logout()">Sair</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style scoped>
.fastFade-enter-from,
.fastFade-leave-to {
  opacity: 0;
}

.fastFade-enter-active,
.fastFade-leave-active {
  transition: opacity 0.15s ease;
}
</style>
