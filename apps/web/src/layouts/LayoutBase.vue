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
import { useEditorStore } from "@/stores/editor";
import { http } from "@/utils/index.ts";

const route = useRoute();
const router = useRouter();
const user = useUserStore();
const editorStore = useEditorStore();

const settingsDialog = ref(false);
const searchRef = ref<InstanceType<typeof GlobalSearch> | null>(null);

const breadcrumbs = computed(() => {
	const crumbs: any[] = [
		{
			label: "Projetos",
			to: { name: "CodeProjects" },
			disabled: route.name === "CodeProjects",
		},
	];

	if (route.name === "CodeEdit") {
		const title = editorStore.info.title || "Sem título";
		crumbs.push({ label: title, to: null, disabled: true });
	} else if (route.name === "CodeNew") {
		crumbs.push({
			label: "Novo projeto",
			to: null,
			disabled: true,
			muted: true,
		});
	}

	return crumbs;
});

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
  <div class="flex flex-col w-screen h-screen overflow-hidden relative bg-[color:var(--n-body-color)]">

    <div class="relative flex items-center w-full p-2">

      <div
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-opacity hover:opacity-80"
        @click="router.push({ name: 'CodeProjects' })"
      >
        <Logo height="30" />
      </div>

      <n-page-header @back="handleBack" class="w-full">

        <template #title>
          <div class="flex items-center h-full ml-1 pt-[2px]">
            <n-breadcrumb>
              <n-breadcrumb-item
                v-for="(crumb, i) in breadcrumbs"
                :key="i"
                @click="!crumb.disabled && crumb.to ? router.push(crumb.to) : null"
              >
                <span :style="{ opacity: crumb.muted ? 0.5 : 1, cursor: crumb.disabled ? 'default' : 'pointer' }">
                  {{ crumb.label }}
                </span>
              </n-breadcrumb-item>
            </n-breadcrumb>
          </div>
        </template>

        <template #extra>
          <div class="flex items-center gap-3">
            <n-button circle quaternary @click="searchRef?.open()">
              <template #icon>
                <n-icon size="20"><Search /></n-icon>
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
                  class="text-xs text-white"
                  :style="{ backgroundColor: 'var(--n-primary-color)' }"
                >
                  <img v-if="user.profilePicture" :src="user.profilePicture" class="object-cover w-full h-full" />
                  <span v-else>{{ (user.name || user.username || '?').charAt(0).toUpperCase() }}</span>
                </n-avatar>
              </n-button>
            </n-dropdown>
          </div>
        </template>

      </n-page-header>
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
      header-style="padding: 16px 24px; border-bottom: 1px solid var(--n-border-color);"
      transform-origin="center"
    >
      <DialogSettings />
    </n-modal>
  </div>
</template>
