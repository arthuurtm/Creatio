<script setup lang="ts">
import {
	LogOutOutline,
	PersonCircleOutline,
	Search,
	SettingsOutline,
} from "@vicons/ionicons5";
import { NIcon } from "naive-ui";
import { computed, h, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import DialogSettings from "@/components/modules/DialogSettings.vue";
import type GlobalSearch from "@/components/modules/GlobalSearch.vue";
import Logo from "@/components/ui/Logo.vue";
import { useUserStore } from "@/stores";
import { http } from "@/utils/index.ts";

const route = useRoute();
const router = useRouter();
const user = useUserStore();

const settingsDialog = ref(false);
const searchRef = ref<InstanceType<typeof GlobalSearch> | null>(null);

const breadcrumbs = computed(() => [
	{
		label: "Início",
		to: { name: "CodeNew" },
		muted: true,
		disabled: route.name === "CodeNew",
	},
	...(route.meta.breadcrumbs ?? []),
	{
		label: route.meta.friendlyName || String(route.name || "Página"),
		disabled: true,
	},
]);


const dropdownOptions = computed(() => [
	{
		label: "Meu perfil",
		key: "profile",
		icon: () =>
			h(NIcon, { size: 16 }, { default: () => h(PersonCircleOutline) }),
	},
	{
		label: "Configurações",
		key: "settings",
		icon: () => h(NIcon, { size: 16 }, { default: () => h(SettingsOutline) }),
	},
	{
		type: "divider",
		key: "d1",
	},
	{
		label: "Sair da conta",
		key: "logout",
		icon: () =>
			h(
				NIcon,
				{ size: 16, color: "rgb(var(--v-theme-error))" },
				{ default: () => h(LogOutOutline) },
			),
	},
]);

function handleDropdownSelect(key: string) {
	if (key === "profile")
		router.push({ name: "UserProfile", params: { username: user.username } });
	if (key === "settings") settingsDialog.value = true;
	if (key === "logout") {
		(window as any).$dialog?.warning({
			title: "Sair da conta?",
			content: "Você será desconectado da sua conta neste dispositivo.",
			positiveText: "Sair",
			negativeText: "Cancelar",
			onPositiveClick: () => http.auth.logout(),
      transformOrigin: "center"
		});
	}
}

// Função para o botão nativo de voltar do n-page-header
function handleBack() {
	router.push({ name: "CodeProjects" });
}

const collapsed = ref(false);
watchEffect(() => {
	collapsed.value = route.meta?.layout?.hideNavigator ?? false;
});
</script>

<template>
  <div class="layout-base flex flex-col w-screen h-screen overflow-hidden relative">

    <div class="layout-header flex items-center w-full gap-4 px-4 py-3">

      <div
        class="layout-logo flex items-center justify-center shrink-0 cursor-pointer"
        @click="router.push({ name: 'Home' })"
      >
        <Logo height="30" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="path-bar flex items-center min-w-0 h-10 px-3 rounded-xl">
          <n-icon size="17" class="shrink-0 mr-2" depth="3">
            <HomeOutlined />
          </n-icon>

          <n-breadcrumb separator="›">
            <n-breadcrumb-item
              v-for="(crumb, i) in breadcrumbs"
              :key="i"
              @click="!crumb.disabled && crumb.to && router.push(crumb.to)"
            >
              <span
                class="path-segment"
                :class="{
                  'path-segment-muted': crumb.muted || crumb.disabled,
                  'path-segment-clickable': !crumb.disabled && !!crumb.to,
                  'path-current': i === breadcrumbs.length - 1
                }"
              >
                {{ crumb.label }}
              </span>
            </n-breadcrumb-item>
          </n-breadcrumb>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <n-button circle quaternary @click="searchRef?.open()">
          <template #icon>
            <n-icon size="19"><Search /></n-icon>
          </template>
        </n-button>

        <n-dropdown
          trigger="click"
          placement="bottom-end"
          :options="dropdownOptions"
          @select="handleDropdownSelect"
        >
          <n-button circle quaternary class="p-0">
            <n-avatar
              round
              class="avatar-text"
              :style="{ backgroundColor: 'var(--color-primary)' }"
            >
              <img
                v-if="user.profilePicture"
                :src="user.profilePicture"
                class="object-cover w-full h-full"
              />
              <span v-else>
                {{ (user.name || user.username || '?').charAt(0).toUpperCase() }}
              </span>
            </n-avatar>
          </n-button>
        </n-dropdown>
      </div>
    </div>

    <!-- Restante do conteúdo -->
    <div class="grow overflow-hidden relative">
      <Transition name="fastFade" mode="out-in">
        <router-view v-slot="{ Component }" :key="route.fullPath">
            <component :is="Component" />
        </router-view>
      </Transition>
    </div>

    <GlobalSearch ref="searchRef" />

    <n-modal
      v-model:show="settingsDialog"
      preset="card"
      style="width: 860px; max-width: 95vw; border-radius: 16px;"
      title="Configurações"
      :bordered="false"
      content-style="padding: 0; overflow: hidden; border-radius: 0 0 16px 16px;"
      header-style="padding: 16px 24px; border-bottom: 1px solid var(--color-border);"
      transform-origin="center"
    >
      <DialogSettings />
    </n-modal>
  </div>
</template>

<style scoped>
.path-bar {
  background: var(--card-color, var(--n-color));
  border: 1px solid var(--border-color, var(--n-border-color));
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.path-segment {
  color: var(--text-color-3);
  font-size: 13px;
  font-weight: 450;
  white-space: nowrap;
  transition: color 0.15s ease;
}

.path-segment-clickable {
  cursor: pointer;
}

.path-segment-clickable:hover {
  color: var(--primary-color);
}

.path-segment-muted {
  opacity: 0.55;
}

.path-current {
  color: var(--text-color-1);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.layout-base {
  min-height: 58px;
  background-color: var(--color-bg);
}
.layout-header {
  border-bottom: 1px solid var(--color-border);
}
.layout-logo {
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.layout-logo:hover {
  opacity: 0.8;
}
.avatar-text {
  font-size: 12px;
  color: #fff;
}
</style>
