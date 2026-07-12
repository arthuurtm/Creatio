<template>
  <v-container fluid class="fill-height align-start pa-0 bg-surface">
    <v-row no-gutters class="fill-height">

      <v-col cols="12" md="3" lg="2" class="pt-4 px-2">
        <v-list nav density="comfortable" bg-color="transparent" border="false">
          <v-list-item v-for="btn in navItems" :key="btn.id" rounded="lg" :active="activeTab === btn.id"
            color="secondary" @click="activeTab = btn.id" class="ga-2" variant="text" density="comfortable">
            <template #prepend>
              <v-btn :icon="btn.icon" class="ma-0" variant="tonal" :color="btn.color" />
            </template>
            <v-list-item-title>{{ btn.text }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>

      <v-col cols="12" md="9" lg="8" class="pa-6">
        <div class="mb-8 text-center text-md-left">
          <h1 class="text-h4 mb-2 font-weight-regular">{{ currentTabTitle }}</h1>
          <p class="text-body-1 text-medium-emphasis" style="max-width: 600px">
            {{ currentTabDescription }}
          </p>
        </div>

        <v-card v-if="activeTab === 'personal'" variant="flat" class="rounded-xl border-opacity-25" color="surface">

          <v-card-item class="py-4 px-6 cursor-pointer hover-bg" @click="triggerFileInput">
            <div class="d-flex justify-space-between align-center">
              <div class="text-body-1 font-weight-medium w-25">Foto do perfil</div>
              <div class="text-body-2 text-medium-emphasis flex-grow-1 px-4 text-truncate">
                Uma foto ajuda a personalizar sua conta
              </div>
              <v-avatar size="60" color="primary" class="elevation-1">
                <v-img v-if="localProfilePic || user.getProfilePicture"
                  :src="localProfilePic || user.getProfilePicture" cover />
                <span v-else class="text-h5 text-white">{{ user.getUsername?.charAt(0)?.toUpperCase() }}</span>
              </v-avatar>
            </div>
            <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="onFileChange">
          </v-card-item>

          <v-divider />

          <template v-for="(field, index) in displayFields" :key="field.key">
            <v-card-item class="py-4 px-6 cursor-pointer hover-bg" @click="handleEdit(field)">
              <div class="d-flex justify-space-between align-center">
                <div class="text-body-2 font-weight-medium text-medium-emphasis w-25">
                  {{ field.label }}
                </div>
                <div class="text-body-1 text-high-emphasis flex-grow-1 px-4 text-truncate">
                  <template v-if="field.val">
                    {{ field.format ? field.format(field.val) : field.val }}
                  </template>
                  <span v-else class="text-disabled font-italic">Não definido</span>
                </div>
                <v-icon icon="chevron_right" color="medium-emphasis" />
              </div>
            </v-card-item>
            <v-divider v-if="index < displayFields.length - 1" />
          </template>
        </v-card>

        <v-row v-if="activeTab === 'security'">
          <v-col cols="12" lg="6">
              <v-card variant="flat" class="rounded-lg border h-100 d-flex flex-column">
                <v-card-item class="pa-6">
                  <template #prepend>
                     <v-avatar color="primary-lighten-5" class="mr-2" rounded>
                        <v-icon color="primary" icon="lock" />
                     </v-avatar>
                  </template>
                  <v-card-title class="text-h6">Senha e autenticação</v-card-title>
                  <v-card-subtitle>Gerencie como você entra na sua conta</v-card-subtitle>
                </v-card-item>

                <v-divider />

                <v-list class="flex-grow-1 rounded-0" lines="two" border="false">
                   <v-list-item title="Senha" @click="router.push({ name: 'PasswordRescue' })" >
                      <template #append><v-icon icon="chevron_right" /></template>
                   </v-list-item>
                </v-list>
              </v-card>
            </v-col>

             <v-col cols="12" lg="6">
              <v-card variant="flat" class="rounded-lg border h-100 d-flex flex-column">
                <v-card-item class="pa-6">
                  <template #prepend>
                     <v-avatar color="success-lighten-5" class="mr-2" rounded>
                        <v-icon color="success" icon="devices" />
                     </v-avatar>
                  </template>
                  <v-card-title class="text-h6">Seus dispositivos</v-card-title>
                  <v-card-subtitle>Sessões ativas no momento</v-card-subtitle>
                </v-card-item>

                <v-divider />

                <v-list class="flex-grow-1" density="comfortable" border="false">
                  <template v-for="session in connectedDevices" :key="session.id">
                    <v-list-item :title="`${session.deviceData.browser} no ${session.deviceData.os}`"
                      :subtitle="formatDate(session.updatedAt)">
                      <template #prepend>
                        <v-icon :icon="getDeviceIcon(session.deviceData)" color="medium-emphasis" class="mr-2" />
                      </template>
                      <template #append>
                        <v-btn
                          icon="logout"
                          variant="text"
                          color="error"
                          size="small"
                          @click="disconnectDevice(session.id)"
                        >
                          <v-tooltip activator="parent" location="top">Desconectar dispositivo</v-tooltip>
                        </v-btn>
                      </template>
                    </v-list-item>
                  </template>
                  <v-list-item v-if="!connectedDevices || connectedDevices.length === 0">
                    <span class="text-medium-emphasis">Carregando dispositivos...</span>
                  </v-list-item>
                </v-list>

                <v-divider />

                <v-card-actions class="pa-4">
                   <v-spacer />
                   <v-btn color="error" variant="outlined" class="text-none" @click="disconnectAllDevices">Desconectar outros dispositivos</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
        </v-row>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { http } from '@/functions/'
import { showToast } from '@/plugins/toast'
import type { DeviceData } from "@projeto/types"
import { useTheme } from 'vuetify'

type Session = {
  id: number
  accessToken: string
  refreshToken: string
  deviceData: DeviceData
  userId: number
  createdAt: Date
  updatedAt: Date
}

const router = useRouter()
const user = useUserStore()
const fileInput = ref<HTMLInputElement | null>(null)
const localProfilePic = ref<string | null>(null)
const activeTab = ref('personal')
const connectedDevices = ref<Session[] | null>(null)
const theme = useTheme()

const navItems = [
  { id: 'personal', text: 'Informações pessoais', icon: 'assignment_ind', color: 'secondary' },
  { id: 'security', text: 'Segurança', icon: 'lock', color: 'error' },
]

const currentTabTitle = computed(() => {
  const item = navItems.find(i => i.id === activeTab.value)
  return item ? item.text : 'Configurações'
})

const currentTabDescription = computed(() => {
  switch (activeTab.value) {
    case 'personal': return 'Gerencie detalhes que deixam sua conta ainda melhor.'
    case 'security': return 'Configurações e recomendações para ajudar a manter sua conta segura.'
    default: return ''
  }
})

const displayFields = computed(() => [
  {
    key: 'username',
    label: 'Nome',
    val: user.username
  },
  {
    key: 'nickname',
    label: 'Apelido',
    val: user.name
  },
  {
    key: 'birthdate',
    label: 'Data de nascimento',
    val: user.additionalData?.birthdate,
    format: (val: any) => formatDate(val)
  },
  {
    key: 'gender',
    label: 'Gênero',
    val: user.additionalData?.gender || 'Masculino'
  },
  {
    key: 'email',
    label: 'E-mail',
    val: user.email
  },
  {
    key: 'theme',
    label: 'Tema',
    val: theme.global.name.value === 'light' ? 'Claro' : theme.global.name.value === 'dark' ? 'Escuro' : theme.global.name.value
  }
])

onMounted(async () => {
  await loadData()
})

async function loadData() {
  try {
    const sessions = await http.get({ type: 'database', route: 'getAllUserSessions' })
    connectedDevices.value = sessions
  } catch (err) {
    console.error('Erro ao carregar dados', err)
  }
}

function formatDate(isoDate: Date) {
  if (!isoDate) return ''
  try {
    const date = new Date(isoDate)
    return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
  } catch {
    return String(isoDate)
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target?.files && target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async () => {
    localProfilePic.value = reader.result as string

    try {
      await http.post({ type: 'database', route: 'updateProfilePic' }, { image: reader.result })
      showToast({ type: 'success', message: 'Foto atualizada!' })
    } catch (err) {
      console.error('Erro upload', err)
      showToast({ type: 'error', message: 'Não foi possível atualizar a foto. Tente novamente.' })
    }
  }
  reader.readAsDataURL(file)
}

/* Navegação para Edição */
function handleEdit(field: any) {
  // Opção A: Abrir Dialog (mais comum em SPAs)
  // openEditDialog(field.key)

  // Opção B: Navegar para rota filha
  console.log('Editando:', field.key)
  // router.push({ name: 'EditField', params: { field: field.key } })
}

async function disconnectDevice(sessionId: number) {
  if (!confirm("Tem certeza de que deseja desconectar este dispositivo?")) return;
  try {
    await http.del({
      type: "database",
      route: "deleteSession",
    }, { sessionId });
    showToast({ type: 'success', message: 'Dispositivo desconectado!' });
    await loadData();
  } catch (err) {
    console.error("Falha ao revogar sessão", err);
    showToast({ type: 'error', message: 'Não foi possível desconectar o dispositivo.' });
  }
}

async function disconnectAllDevices() {
  if (!confirm('Desconectar todos os outros dispositivos?')) return
  try {
    await http.auth.logoutAll()
    showToast({ type: 'success', message: 'Outros dispositivos desconectados!' })
    await loadData();
  } catch (err) {
    showToast({ type: 'error', message: 'Erro ao desconectar dispositivos.' })
  }
}

const getDeviceIcon = (d: DeviceData) =>
  (d.browser === 'Android' || d.browser === 'iOS')
    ? 'smartphone'
    : 'computer'

</script>

<style scoped>
.hover-bg {
  transition: background-color 0.2s ease;
}

.hover-bg:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.12) !important;
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
