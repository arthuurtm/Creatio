<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { http } from "@/functions/index.ts";
import { useUserStore } from "@/stores";
import DialogSettings from "@/views/global/DialogSettings.vue";

const router = useRouter();
const user = useUserStore();

const logoutLoading = ref(false);
const logoutDialog = ref(false);
const settingsDialog = ref(false);

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

				<v-list density="comfortable" nav class="px-2 bg-transparent d-flex flex-column ga-1">
					<v-list-item
						prepend-icon="account_circle"
						title="Meu perfil"
						rounded="lg"
						class="menu-item"
						@click="router.push({ name: 'UserProfile', params: { username: user.username } })"
					/>

					<v-list-item
						prepend-icon="settings"
						title="Configurações"
						rounded="lg"
						class="menu-item"
						@click="settingsDialog = true"
					/>

					<v-divider class="my-1 opacity-40" />

					<v-list-item
						prepend-icon="logout"
						title="Sair da conta"
						rounded="lg"
						class="menu-item logout-item"
						@click="logoutDialog = true"
					/>
				</v-list>
			</v-card>
		</v-menu>

		<!-- Dialogs -->
		<v-dialog v-model="logoutDialog" width="auto">
			<v-card max-width="400" prepend-icon="logout" title="Sair da conta" rounded="xl" elevation="10" border="true">
				<v-card-text>Você deseja encerrar sua sessão atual?</v-card-text>
				<v-card-actions class="px-4 pb-4">
					<v-spacer />
					<v-btn variant="text" rounded="pill" :disabled="logoutLoading" @click="logoutDialog = false">Cancelar</v-btn>
					<v-btn color="error" variant="flat" rounded="pill" :loading="logoutLoading" @click="handleLogout">Sair</v-btn>
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

.menu-item {
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	color: rgba(var(--v-theme-on-surface), 0.8) !important;
}

.menu-item:hover {
	background-color: rgba(var(--v-theme-primary), 0.08) !important;
	color: rgb(var(--v-theme-primary)) !important;
	transform: translateX(3px);
}

.logout-item:hover {
	background-color: rgba(var(--v-theme-error), 0.08) !important;
	color: rgb(var(--v-theme-error)) !important;
}
</style>
