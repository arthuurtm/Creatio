<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import Logo from "@/components/ui/Logo.vue";
import UserProfileMenu from "@/components/modules/UserProfileMenu.vue";
import SidebarProjects from "@/components/modules/SidebarProjects.vue";

const route = useRoute();
const router = useRouter();
const drawer = ref(true);

const collapsed = ref(false);
watchEffect(() => {
  collapsed.value = route.meta?.layout?.hideNavigator ?? false;
});
</script>

<template>
  <v-layout class="fill-viewport">
    <v-app-bar
      elevation="0"
      flat
      :class="[
        'px-2 transition-all',
        collapsed ? 'app-bar-absolute' : 'header-blur'
      ]"
      rounded="0"
    >
      <transition name="fade-fast">
        <v-app-bar-nav-icon v-if="!collapsed" @click="drawer = !drawer"></v-app-bar-nav-icon>
      </transition>

      <v-spacer />
      <Logo style="height: 36px; cursor: pointer" @click="router.push({ name: 'Home' })" />
      <v-spacer />

      <transition name="fade-fast">
        <UserProfileMenu v-if="!collapsed" />
      </transition>
    </v-app-bar>

    <v-navigation-drawer
      v-if="!collapsed"
      v-model="drawer"
      :rounded="0"
      elevation="1"
      temporary
    >
      <v-list nav class="px-3 pt-1">
        <v-list-subheader class="text-overline text-medium-emphasis px-3">
          Explorar
        </v-list-subheader>

        <v-list-item
          :active="route.name === 'Home'"
          prepend-icon="hub"
          title="Feed público"
          value="home"
          rounded="pill"
          color="primary"
          class="text-none mb-1 px-4 font-weight-medium list-item-animate"
          @click="router.push({ name: 'Home' })"
        />

        <v-list-item
          :active="route.name === 'CodeProjects'"
          prepend-icon="terminal"
          title="Seus projetos"
          value="projects"
          rounded="pill"
          color="primary"
          class="text-none mb-1 px-4 font-weight-medium list-item-animate"
          @click="router.push({ name: 'CodeProjects' })"
        />

        <v-divider class="my-2 opacity-50" />

        <SidebarProjects />
      </v-list>
    </v-navigation-drawer>

    <v-main :class="['scrollable-content', { 'pt-0': collapsed }]">
      <router-view v-slot="{ Component }">
        <!-- <transition name="fade" mode="out-in"> -->
          <component :is="Component" />
        <!-- </transition> -->
      </router-view>
    </v-main>
  </v-layout>
</template>

<style scoped>
.fill-viewport {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.scrollable-content {
  height: 100vh;
  overflow-y: auto;
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Quando NÃO colapsada: Aplica o fundo semitransparente com desfoque (Blur) */
.header-blur {
  /* Altere para o background correto do seu tema (light ou dark) com opacidade de 70% a 85% */
  background-color: rgba(var(--v-theme-surface), 0.75) !important;

  /* O segredo do efeito vidro fosco */
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important; /* Suporte para Safari */

  /* Opcional: uma borda inferior cirúrgica bem sutil para dar acabamento */
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06) !important;
}

/* Quando colapsada, limpamos completamente o background e o blur */
.app-bar-absolute {
  position: absolute !important;
  background-color: transparent !important;
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border-bottom: none !important;
}

.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Hover suave nos itens da lista */
.list-item-animate {
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.list-item-animate:active {
  transform: scale(0.98);
}

.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.12) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600 !important;
}

/* 2. Transição rápida para os ícones da Navbar */
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.15s ease;
}
.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}
</style>
