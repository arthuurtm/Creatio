<script setup lang="ts">
import { ref, watchEffect, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import Logo from "@/components/ui/Logo.vue";
import { http } from "@/functions/index.ts";
import { useUserStore } from "@/stores";
import DialogSettings from "@/views/global/DialogSettings.vue";
import { useTheme } from "vuetify";
import { useEditorExplorer } from "@/composables/useEditorExplorer.ts";

const route = useRoute();
const router = useRouter();
const user = useUserStore();
const theme = useTheme();
const { editorStore } = useEditorExplorer();

const logoutLoading = ref(false);
const logoutDialog = ref(false);
const settingsDialog = ref(false);
const drawer = ref(true);
const isMobile = ref(false);
const createLoading = ref(false);

const collapsedHeader = ref(false);
watchEffect(() => {
	collapsedHeader.value = route.meta?.layout?.hideNavigator ?? false;
});

function checkMobile() {
	isMobile.value = window.innerWidth < 960;
	drawer.value = !isMobile.value;
}

onMounted(() => {
	checkMobile();
	window.addEventListener("resize", checkMobile);
});

onBeforeUnmount(() => {
	window.removeEventListener("resize", checkMobile);
});

function toggleTheme() {
	theme.global.name.value = theme.global.name.value === "dark" ? "light" : "dark";
}

async function criarNovoProjeto() {
	if (createLoading.value) return;
	createLoading.value = true;
	try {
		const result = await http.post(
			{ type: "database", route: "setProject" },
			{ state: editorStore.$state },
		);

		Object.assign(editorStore.info, {
			id: result.id,
			title: result.title,
		});

		router.push({ name: "CodeEdit", params: { id: result.id } });
	} catch (error) {
		console.error("Erro ao criar projeto:", error);
	} finally {
		createLoading.value = false;
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
	<v-app>
		<v-app-bar
			v-if="isMobile && !collapsedHeader"
			elevation="0"
			border="bottom"
			color="background"
			class="px-2"
		>
			<v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
			<Logo style="height: 32px" class="ml-2" />
			<v-spacer />
			<v-avatar
				size="36"
				color="primary"
				class="cursor-pointer"
				@click="router.push({ name: 'UserProfile', params: { username: user.username } })"
			>
				<v-img :src="user.profilePicture"></v-img>
			</v-avatar>
		</v-app-bar>

		<v-navigation-drawer
			v-if="!collapsedHeader"
			v-model="drawer"
			:permanent="!isMobile"
			:temporary="isMobile"
			:width="isMobile ? 280 : 244"
			color="surface-container"
			:rounded="0"
			elevation="0"
		>
			<div class="pa-5 pb-4 d-flex align-center justify-space-between">
				<Logo style="height: 36px; cursor: pointer" @click="router.push({ name: 'Home' })" />
				<v-btn v-if="isMobile" icon="chevron_left" variant="text" @click="drawer = false"></v-btn>
			</div>

			<div class="px-4 pb-3">
				<v-btn
					color="primary"
					variant="flat"
					block
					rounded="pill"
					size="large"
					prepend-icon="add"
					class="text-none font-weight-bold elevation-1 create-btn"
					:loading="createLoading"
					@click="criarNovoProjeto"
				>
					Criar Código
				</v-btn>
			</div>

			<v-list nav class="px-3 pt-1">
				<v-list-subheader class="text-overline text-medium-emphasis px-3">
					Explorar
				</v-list-subheader>

				<v-list-item
					:active="route.name === 'Home'"
					prepend-icon="hub"
					title="Feed Público"
					value="home"
					rounded="pill"
					color="primary"
					class="text-none mb-1 px-4 font-weight-medium"
					@click="router.push({ name: 'Home' })"
				/>

				<v-list-item
					:active="route.name === 'CodeProjects'"
					prepend-icon="terminal"
					title="Seus Projetos"
					value="projects"
					rounded="pill"
					color="primary"
					class="text-none mb-1 px-4 font-weight-medium"
					@click="router.push({ name: 'CodeProjects' })"
				/>

				<v-list-subheader class="text-overline text-medium-emphasis px-3 mt-2">
					Conta
				</v-list-subheader>

				<v-list-item
					:active="route.name === 'UserProfile' && route.params.username === user.username"
					prepend-icon="account_circle"
					title="Meu Perfil"
					value="profile"
					rounded="pill"
					color="primary"
					class="text-none mb-1 px-4 font-weight-medium"
					@click="router.push({ name: 'UserProfile', params: { username: user.username } })"
				/>

				<v-list-item
					prepend-icon="settings"
					title="Configurações"
					value="settings"
					rounded="pill"
					color="primary"
					class="text-none mb-1 px-4 font-weight-medium"
					@click="settingsDialog = true"
				/>
			</v-list>

			<template #append>
				<v-divider class="mx-4 opacity-50" />

				<div class="pa-4 d-flex align-center justify-space-between gap-3">
					<div class="d-flex align-center ga-3 overflow-hidden" style="max-width: 170px">
						<v-avatar size="40" color="primary">
							<v-img :src="user.profilePicture"></v-img>
						</v-avatar>
						<div class="d-flex flex-column text-left overflow-hidden">
							<span class="text-body-2 font-weight-bold text-truncate text-high-emphasis">{{ user.name || user.username }}</span>
							<span class="text-caption text-truncate text-medium-emphasis">@{{ user.username }}</span>
						</div>
					</div>

					<v-btn icon="logout" variant="text" color="medium-emphasis" size="small" @click="logoutDialog = true"></v-btn>
				</div>

				<div class="px-4 pb-4 pt-1">
					<v-btn
						block
						variant="tonal"
						rounded="pill"
						density="comfortable"
						class="text-none text-caption font-weight-medium text-medium-emphasis"
						:prepend-icon="theme.global.name.value === 'dark' ? 'light_mode' : 'dark_mode'"
						@click="toggleTheme"
					>
						Tema {{ theme.global.name.value === 'dark' ? 'Claro' : 'Escuro' }}
					</v-btn>
				</div>
			</template>
		</v-navigation-drawer>

		<v-main>
			<router-view v-slot="{ Component }">
				<transition name="page-fade" mode="out-in">
					<component :is="Component" />
				</transition>
			</router-view>
		</v-main>

		<v-dialog v-model="logoutDialog" width="auto">
			<v-card max-width="400" prepend-icon="logout" title="Sair da conta">
				<v-card-text>Você deseja encerrar sua sessão atual?</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn variant="text" :disabled="logoutLoading" @click="logoutDialog = false">Cancelar</v-btn>
					<v-btn color="error" variant="flat" :loading="logoutLoading" @click="handleLogout">Sair</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="settingsDialog" fullscreen transition="dialog-bottom-transition">
			<v-card rounded="0">
				<v-toolbar title="Configurações" class="rounded-0" density="compact">
					<v-spacer />
					<v-btn icon="close" variant="text" @click="settingsDialog = false"></v-btn>
				</v-toolbar>
				<v-card-text class="pa-0">
					<dialog-settings />
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text="Fechar" @click="settingsDialog = false"></v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-app>
</template>

<style scoped>
.create-btn {
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.create-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2) !important;
}

.v-list-item--active {
	background-color: rgba(var(--v-theme-primary), 0.12) !important;
	color: rgb(var(--v-theme-primary)) !important;
	font-weight: 600 !important;
}
</style>
