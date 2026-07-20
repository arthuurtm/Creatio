<script setup lang="ts">
import { ref, watchEffect, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import SidebarProjects from "@/components/modules/SidebarProjects.vue";
import ContextMenu from "@/components/ui/ContextMenu.vue";
import { http } from "@/utils/index.ts";
import { useUserStore } from "@/stores";
import DialogSettings from "@/components/modules/DialogSettings.vue";

const route = useRoute();
const router = useRouter();
const user = useUserStore();
const rail = ref(true);
const settingsDialog = ref(false);
const logoutDialog = ref(false);

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
  try {
    await http.auth.logout();
  } finally {
    return;
  }
}

const collapsed = ref(false);
watchEffect(() => {
  collapsed.value = route.meta?.layout?.hideNavigator ?? false;
});
</script>

<template>
  <v-layout class="fill-viewport">
    <v-navigation-drawer
      v-if="!collapsed"
      :rail="rail"
      :rail-width="60"
      :rounded="0"
      permanent
    >
      <v-list>
        <v-list-item
          :title="user.name"
        >
          <template v-slot:prepend>
            <v-avatar class="cursor-pointer"
            :icon="user.profilePicture ? user.profilePicture : 'account_circle'"></v-avatar>

            <v-menu activator="parent">
              <ContextMenu
                :is-visible="true"
                :items="menuItems"
                @select="handleMenuSelect"
              />
            </v-menu>
          </template>

          <template v-slot:append>
            <v-icon @click.stop="rail = !rail" :inert="rail" :variant="'text'" icon="menu_open"></v-icon>
          </template>
        </v-list-item>
      </v-list>

      <v-divider/>

      <v-list nav>
        <v-list-item
          :active="route.name === 'CodeProjects'"
          prepend-icon="terminal"
          title="Seus projetos"
          value="projects"
          rounded="pill"
          color="primary"
          @click="router.push({ name: 'CodeProjects' })"
          @click.stop="rail = !rail"
        />
      </v-list>

      <SidebarProjects :rail="rail" @expand="rail = false" />
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
