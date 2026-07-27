<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
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

const menuItems = computed(() => [
	{ text: "Meu perfil", value: "profile", icon: "account_circle" },
	{ text: "Configurações", value: "settings", icon: "settings" },
	{ text: "Sair da conta", value: "logout", icon: "logout" },
]);

function handleMenuSelect(item: any) {
	if (item.value === "profile")
		router.push({ name: "UserProfile", params: { username: user.username } });
	if (item.value === "settings") settingsDialog.value = true;
	if (item.value === "logout") http.auth.logout();
}

const collapsed = ref(false);
watchEffect(() => {
	collapsed.value = route.meta?.layout?.hideNavigator ?? false;
});
</script>

<template>
  <v-layout class="fill-viewport">

    <v-app-bar v-if="!collapsed" flat rounded="0" border="b" :height="47">

      <template #prepend>
        <div class="d-flex align-center pl-3 ga-1">

          <v-btn
            variant="text"
            density="comfortable"
            class="px-2"
            style="min-width: 0"
            @click="router.push({ name: 'CodeProjects' })"
          >
            <Logo height="24" />
          </v-btn>

          <template v-for="(crumb, i) in breadcrumbs" :key="i">
            <v-icon size="14" class="text-disabled mx-1">chevron_right</v-icon>

            <v-btn
              v-if="!crumb.disabled"
              variant="text"
              density="comfortable"
              class="text-none px-2"
              style="min-width: 0; font-size: 0.875rem"
              @click="crumb.to && router.push(crumb.to)"
            >
              {{ crumb.label }}
            </v-btn>

            <span
              v-else
              class="text-body-2 font-weight-medium text-truncate"
              :class="{ 'text-disabled': crumb.muted }"
              style="max-width: 220px"
            >
              {{ crumb.label }}
            </span>
          </template>

        </div>
      </template>

      <template #append>
        <div class="d-flex align-center ga-1 pr-2">

          <v-btn
            icon="search"
            variant="text"
            density="comfortable"
            @click="searchRef?.open()"
          />

          <v-btn icon variant="text" density="comfortable">
            <v-avatar
              :image="user.profilePicture || undefined"
              :color="user.profilePicture ? undefined : 'primary'"
              size="26"
            >
              <span
                v-if="!user.profilePicture"
                class="text-caption font-weight-bold"
                style="font-size: 0.65rem"
              >
                {{ (user.name || user.username || '?').charAt(0).toUpperCase() }}
              </span>
            </v-avatar>

            <v-menu activator="parent" location="bottom end">
              <v-card rounded="xl" flat border min-width="180">
                <v-list density="compact" class="pa-2">
                  <v-list-item
                    v-for="item in menuItems"
                    :key="item.value"
                    :title="item.text"
                    :prepend-icon="item.icon"
                    class="rounded-lg mb-1"
                    color="primary"
                    @click="handleMenuSelect(item)"
                  />
                </v-list>
              </v-card>
            </v-menu>
          </v-btn>

        </div>
      </template>

    </v-app-bar>

    <v-main>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </v-main>

    <GlobalSearch ref="searchRef" />

  </v-layout>
</template>
