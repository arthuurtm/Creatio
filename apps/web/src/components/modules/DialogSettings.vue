<template>
  <div class="flex w-full min-h-[460px]">

    <!-- ── Sidebar ────────────────────────────────────────────────── -->
    <div class="w-[200px] shrink-0 border-r border-[color:var(--n-border-color)] p-2.5">
      <n-list hoverable :bordered="false" class="bg-transparent">
        <n-list-item
          v-for="btn in navItems"
          :key="btn.id"
          @click="activeTab = btn.id"
          class="cursor-pointer rounded-lg px-3 py-2.5 mb-0.5"
          :style="{
            backgroundColor: activeTab === btn.id ? 'var(--n-action-color)' : 'transparent',
          }"
        >
          <n-space align="center" :size="10">
            <n-icon size="18" :color="activeTab === btn.id ? 'var(--n-primary-color)' : undefined">
              <component :is="getIconComponent(btn.icon)" />
            </n-icon>
            <span class="text-sm" :style="{ fontWeight: activeTab === btn.id ? '600' : 'normal' }">{{ btn.text }}</span>
          </n-space>
        </n-list-item>
      </n-list>
    </div>

    <!-- ── Content ────────────────────────────────────────────────── -->
    <div class="flex-1 min-w-0 px-7 py-6 overflow-y-auto max-h-[75vh]">

        <!-- Page title -->
        <div class="mb-6">
          <h2 class="text-xl m-0 mb-1 font-semibold">{{ currentTabTitle }}</h2>
          <p class="text-[13px] opacity-60 m-0">{{ currentTabDescription }}</p>
        </div>

        <!-- ══ TAB: Informações pessoais ═══════════════════════════════ -->
        <div v-if="activeTab === 'personal'">

          <!-- Avatar picker -->
          <n-card :bordered="true" class="rounded-xl mb-4" content-style="padding: 0;">
            <div
              @click="triggerFileInput"
              class="px-5 py-4 cursor-pointer flex items-center justify-between transition-colors duration-150 settings-row"
            >
              <div class="flex flex-col gap-0.5">
                <span class="text-sm font-medium">Foto do perfil</span>
                <span class="text-xs opacity-55">Clique para alterar sua foto</span>
              </div>
              <div class="flex items-center gap-3">
                <n-avatar round :size="52" :style="{ backgroundColor: 'var(--n-primary-color)' }">
                  <img v-if="localProfilePic || user.getProfilePicture" :src="localProfilePic || user.getProfilePicture" class="object-cover w-full h-full" />
                  <span v-else class="text-lg text-white">{{ user.getUsername?.charAt(0)?.toUpperCase() }}</span>
                </n-avatar>
                <n-icon size="16" class="opacity-40"><ChevronForward /></n-icon>
              </div>
              <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileChange">
            </div>
          </n-card>

          <!-- Editable fields -->
          <n-card :bordered="true" class="rounded-xl" content-style="padding: 0;">
            <template v-for="(field, index) in editableFields" :key="field.key">

              <!-- Viewing mode -->
              <div
                v-if="editingKey !== field.key"
                @click="startEdit(field)"
                class="px-5 py-4 cursor-pointer flex items-center justify-between transition-colors duration-150 settings-row"
              >
                <div class="flex-1 min-w-0">
                  <div class="text-xs opacity-55 mb-0.5 font-medium uppercase tracking-[0.4px]">{{ field.label }}</div>
                  <div class="text-sm font-medium truncate">
                    <template v-if="field.displayValue">{{ field.displayValue }}</template>
                    <span v-else class="opacity-40 italic font-normal">Não definido</span>
                  </div>
                </div>
                <n-icon size="16" class="opacity-35 ml-3 shrink-0"><CreateOutline /></n-icon>
              </div>

              <!-- Editing mode -->
              <div v-else class="px-5 py-4 bg-[color:var(--n-action-color)]">
                <div class="text-xs opacity-55 mb-2 font-medium uppercase tracking-[0.4px]">{{ field.label }}</div>
                <n-input
                  v-if="field.type !== 'select'"
                  v-model:value="editValue"
                  :type="field.type || 'text'"
                  :placeholder="`Editar ${field.label.toLowerCase()}...`"
                  autofocus
                  @keydown.enter="saveEdit(field)"
                  @keydown.esc="cancelEdit"
                />
                <n-select
                  v-else
                  v-model:value="editValue"
                  :options="field.options"
                />
                <n-space align="center" :size="8" class="mt-3">
                  <n-button
                    type="primary"
                    size="small"
                    round
                    :loading="saveLoading"
                    @click="saveEdit(field)"
                  >
                    Salvar
                  </n-button>
                  <n-button size="small" round quaternary @click="cancelEdit">
                    Cancelar
                  </n-button>
                </n-space>
              </div>

              <n-divider v-if="index < editableFields.length - 1" class="m-0" />
            </template>
          </n-card>
        </div>

        <!-- ══ TAB: Segurança ══════════════════════════════════════════ -->
        <div v-if="activeTab === 'security'" class="flex flex-col gap-4">

          <!-- Senha -->
          <n-card class="rounded-xl" content-style="padding: 0;">
            <div class="p-5 flex items-center gap-3.5">
              <n-avatar round :style="{ backgroundColor: 'var(--n-action-color)' }">
                <n-icon color="var(--n-primary-color)"><LockClosedOutline /></n-icon>
              </n-avatar>
              <div>
                <h3 class="text-[15px] m-0 font-semibold">Senha e autenticação</h3>
                <p class="text-xs opacity-60 mt-1">Gerencie como você entra na sua conta</p>
              </div>
            </div>
            <n-divider class="m-0" />
            <n-list hoverable :bordered="false">
              <n-list-item @click="router.push({ name: 'PasswordRescue' })" class="cursor-pointer px-5 py-3.5">
                <div class="flex justify-between items-center">
                  <div>
                    <div class="text-sm font-medium">Alterar senha</div>
                    <div class="text-xs opacity-55 mt-0.5">Recomendamos uma senha forte e única</div>
                  </div>
                  <n-icon size="16" class="opacity-40"><ChevronForward /></n-icon>
                </div>
              </n-list-item>
            </n-list>
          </n-card>

          <!-- Dispositivos conectados -->
          <n-card class="rounded-xl" content-style="padding: 0;">
            <div class="p-5 flex items-center justify-between">
              <div class="flex items-center gap-3.5">
                <n-avatar round :style="{ backgroundColor: 'var(--n-action-color)' }">
                  <n-icon color="rgb(var(--v-theme-primary))"><LaptopOutline /></n-icon>
                </n-avatar>
                <div>
                  <h3 class="text-[15px] m-0 font-semibold">Seus dispositivos</h3>
                  <p class="text-xs opacity-60 mt-1">Sessões ativas no momento</p>
                </div>
              </div>
              <n-spin v-if="devicesLoading" size="small" />
            </div>
            <n-divider class="m-0" />

            <!-- Skeletons while loading -->
            <div v-if="devicesLoading" class="px-5 py-3 flex flex-col gap-3">
              <n-space v-for="n in 3" :key="n" align="center" :size="12">
                <n-skeleton circle class="h-8 w-8" />
                <n-space vertical :size="4">
                  <n-skeleton text class="w-40 h-3.5" />
                  <n-skeleton text class="w-24 h-3" />
                </n-space>
              </n-space>
            </div>

            <!-- Session list -->
            <n-list v-else-if="connectedDevices && connectedDevices.length" :bordered="false">
              <template v-for="session in connectedDevices" :key="session.id">
                <n-list-item class="px-5 py-3">
                  <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-3">
                      <n-avatar round size="small" :style="{ backgroundColor: 'var(--n-action-color)' }">
                        <n-icon size="16">
                          <component :is="getIconComponent(getDeviceIcon(session.deviceData))" />
                        </n-icon>
                      </n-avatar>
                      <div class="flex flex-col">
                        <span class="text-[13px] font-medium">{{ session.deviceData.browser }} · {{ session.deviceData.os }}</span>
                        <span class="text-[11px] opacity-55">{{ formatDate(session.updatedAt) }}</span>
                      </div>
                    </div>
                    <n-button @click="disconnectDevice(session.id)" type="error" text size="small">
                      <template #icon>
                        <n-icon size="16"><LogOutOutline /></n-icon>
                      </template>
                    </n-button>
                  </div>
                </n-list-item>
              </template>
            </n-list>

            <div v-else class="p-6 text-center opacity-50 text-[13px]">
              Nenhum dispositivo encontrado
            </div>

            <n-divider class="m-0" />
            <div class="px-5 py-3.5 flex justify-end">
              <n-button @click="disconnectAllDevices" type="error" ghost size="small" round>
                Desconectar outros dispositivos
              </n-button>
            </div>
          </n-card>
        </div>

      </div>
    </div>
</template>


<script setup lang="ts">
import type { DeviceData } from "@projeto/types";
import { computed, onMounted, ref } from "vue";
import { getIconComponent } from "@/utils/icons";
import { ChevronForward, CreateOutline, LockClosedOutline, LaptopOutline, LogOutOutline } from "@vicons/ionicons5";
import { useRouter } from "vue-router";
import { showToast } from "@/plugins/toast";
import { useSettingsStore } from "@/stores/global";
import { useUserStore } from "@/stores/user";
import { http } from "@/utils/";

type Session = {
	id: number;
	accessToken: string;
	refreshToken: string;
	deviceData: DeviceData;
	userId: number;
	createdAt: Date;
	updatedAt: Date;
};

const router = useRouter();
const user = useUserStore();
const settingsStore = useSettingsStore();
const fileInput = ref<HTMLInputElement | null>(null);
const localProfilePic = ref<string | null>(null);
const activeTab = ref("personal");
const connectedDevices = ref<Session[] | null>(null);
const devicesLoading = ref(false);

// ── Inline editing state ────────────────────────────────────────────────
const editingKey = ref<string | null>(null);
const editValue = ref<string>("");
const saveLoading = ref(false);

// ── Navigation ──────────────────────────────────────────────────────────
const navItems = [
	{ id: "personal", text: "Informações pessoais", icon: "assignment_ind" },
	{ id: "security", text: "Segurança", icon: "lock" },
];

const currentTabTitle = computed(() => {
	const item = navItems.find((i) => i.id === activeTab.value);
	return item ? item.text : "Configurações";
});

const currentTabDescription = computed(() => {
	switch (activeTab.value) {
		case "personal":
			return "Gerencie os detalhes da sua conta e preferências.";
		case "security":
			return "Configurações para ajudar a manter sua conta segura.";
		default:
			return "";
	}
});

// ── Editable fields definition ─────────────────────────────────────────
const editableFields = computed(() => [
	{
		key: "username",
		label: "Usuário",
		displayValue: user.username,
		currentValue: user.username,
		type: "text",
		endpoint: "updateProfileField",
	},
	{
		key: "nickname",
		label: "Nome de exibição",
		displayValue: user.name,
		currentValue: user.name,
		type: "text",
		endpoint: "updateProfileField",
	},
	{
		key: "email",
		label: "E-mail",
		displayValue: user.email,
		currentValue: user.email,
		type: "text",
		endpoint: "updateProfileField",
	},
	{
		key: "theme",
		label: "Tema da interface",
		displayValue: settingsStore.theme === "light" ? "☀️ Claro" : "🌙 Escuro",
		currentValue: settingsStore.theme,
		type: "select",
		options: [
			{ label: "☀️ Claro", value: "light" },
			{ label: "🌙 Escuro", value: "dark" },
		],
		endpoint: "theme",
	},
]);

// ── Inline edit actions ────────────────────────────────────────────────
function startEdit(field: any) {
	editingKey.value = field.key;
	editValue.value = field.currentValue || "";
}

function cancelEdit() {
	editingKey.value = null;
	editValue.value = "";
}

async function saveEdit(field: any) {
	if (field.key === "theme") {
		const newTheme = editValue.value as "light" | "dark";
		settingsStore.$patch({ theme: newTheme });
		showToast({
			type: "success",
			message: `Tema alterado para ${newTheme === "light" ? "Claro" : "Escuro"}.`,
		});
		cancelEdit();
		return;
	}

	const val = editValue.value.trim();
	if (!val) {
		showToast({ type: "error", message: "O valor não pode ser vazio." });
		return;
	}

	saveLoading.value = true;
	try {
		await http.put(
			{ type: "database", route: "updateProfileField" },
			{ field: field.key, value: val },
		);

		if (field.key === "username") user.username = val;
		if (field.key === "nickname") user.name = val;
		if (field.key === "email") user.email = val;

		showToast({
			type: "success",
			message: `${field.label} atualizado com sucesso!`,
		});
		cancelEdit();
	} catch (err) {
		showToast({
			type: "error",
			message: err instanceof Error ? err.message : "Falha ao atualizar o campo.",
		});
	} finally {
		saveLoading.value = false;
	}
}

// ── Avatar ──────────────────────────────────────────────────────────────
function triggerFileInput() {
	fileInput.value?.click();
}

function onFileChange(e: Event) {
	const target = e.target as HTMLInputElement;
	const file = target?.files && target.files[0];
	if (!file) return;

	const formData = new FormData();
	formData.append("file", file);

	localProfilePic.value = URL.createObjectURL(file);

	http.post({ type: "database", route: "uploadProfilePic" }, formData)
		.then((res) => {
			if (res.url) {
				user.profilePicture = res.url;
			}
			showToast({ type: "success", message: "Foto de perfil atualizada!" });
		})
		.catch((err) => {
			showToast({
				type: "error",
				message: err instanceof Error ? err.message : "Não foi possível atualizar a foto. Tente novamente.",
			});
		});
}

// ── Sessions & devices ─────────────────────────────────────────────────
onMounted(async () => {
	await loadData();
});

async function loadData() {
	devicesLoading.value = true;
	try {
		const sessions = await http.get({
			type: "database",
			route: "getAllUserSessions",
		});
		connectedDevices.value = sessions;
	} catch (err) {
		console.error("Erro ao carregar sessões", err);
	} finally {
		devicesLoading.value = false;
	}
}

async function disconnectDevice(sessionId: number) {
	(window as any).$dialog?.warning({
		title: "Desconectar dispositivo?",
		content: "Essa sessão será encerrada imediatamente.",
		positiveText: "Desconectar",
		negativeText: "Cancelar",
		onPositiveClick: async () => {
			try {
				await http.del(
					{ type: "database", route: "deleteSession" },
					{ sessionId },
				);
				showToast({ type: "success", message: "Dispositivo desconectado!" });
				await loadData();
			} catch {
				showToast({
					type: "error",
					message: "Não foi possível desconectar o dispositivo.",
				});
			}
		},
	});
}

async function disconnectAllDevices() {
	(window as any).$dialog?.warning({
		title: "Desconectar outros dispositivos?",
		content:
			"Todos os outros dispositivos serão desconectados. Apenas sua sessão atual permanecerá ativa.",
		positiveText: "Desconectar todos",
		negativeText: "Cancelar",
		onPositiveClick: async () => {
			try {
				await http.auth.logoutAll();
				showToast({
					type: "success",
					message: "Outros dispositivos desconectados!",
				});
				await loadData();
			} catch {
				showToast({
					type: "error",
					message: "Erro ao desconectar dispositivos.",
				});
			}
		},
	});
}

function formatDate(isoDate: Date) {
	if (!isoDate) return "";
	try {
		const date = new Date(isoDate);
		const diff = Date.now() - date.getTime();
		const min = Math.floor(diff / 60000);
		const h = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);
		if (min < 1) return "agora mesmo";
		if (min < 60) return `há ${min} min`;
		if (h < 24) return `há ${h}h`;
		if (days < 7) return `há ${days} dia${days !== 1 ? "s" : ""}`;
		return new Intl.DateTimeFormat("pt-BR", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		}).format(date);
	} catch {
		return String(isoDate);
	}
}

const getDeviceIcon = (d: DeviceData) =>
	d.browser === "Android" || d.browser === "iOS" ? "smartphone" : "computer";
</script>

<style scoped>
.settings-row:hover {
  background-color: var(--n-action-color);
}
</style>
