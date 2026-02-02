<template>
  <v-container fluid class="fill-height align-start pa-0 bg-surface">
    <v-row no-gutters class="fill-height">

      <v-col cols="12" md="3" lg="2" class="pt-4 px-2">
        <v-list nav density="comfortable" bg-color="transparent">
          <v-list-item v-for="btn in navItems" :key="btn.id" rounded="pill" :active="actualPage === btn.id"
            color="secondary" @click="activeTab = btn.id" class="ga-2" variant="text" density="comfortable">
            <template #prepend>
              <v-btn :icon="btn.icon" class="ma-0" variant="tonal" :color="btn.color" />
            </template>
            <v-list-item-title>{{ btn.text }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>

      <v-col cols="12" md="9" lg="8" class="pa-6">
        <div style="max-width: 850px; margin: 0 auto;">

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

          <v-card v-if="activeTab === 'security'" variant="flat" class="rounded-lg border-opacity-25 pa-4">


            <!-- Alterar senha -->
            <div class="mb-4">
              <span class="text-body-1 font-weight-medium">Senha</span>
              <div class="text-body-2 text-medium-emphasis mb-2">
                Troque sua senha para manter sua conta segura.
              </div>
              <v-btn color="primary" variant="text" density="comfortable"
                @click="router.push({ name: 'PasswordRescue' })">
                Alterar senha
              </v-btn>
            </div>

            <v-divider class="my-4"></v-divider>

            <!-- Dispositivos -->
            <div>
              <span class="text-body-1 font-weight-medium">Dispositivos</span>
              <div class="text-body-2 text-medium-emphasis mb-3">
                Sessões conectadas à sua conta.
              </div>

              <v-list density="comfortable" class="rounded-lg border opacity-80">
                <template v-for="session in connectedDevices" :key="session.id">
                  <v-list-item :title="`${session.deviceData.browser} — ${session.deviceData.os}`"
                    :subtitle="formatDate(session.updatedAt)" :prepend-icon="getDeviceIcon(session.deviceData)">
                    <template #append>
                      <!-- <v-chip v-if="itsMe(session)" size="small" color="primary" variant="flat"
                        class="font-weight-medium">
                        Este dispositivo
                      </v-chip> -->
                    </template>
                  </v-list-item>

                  <!-- <v-divider v-if="!isLast(session, connectedDevices)" /> -->
                </template>

                <v-list-item v-if="!connectedDevices">
                  Nenhum dispositivo ativo.
                </v-list-item>
              </v-list>

              <v-btn class="mt-3" color="primary" variant="flat" @click="disconnectAllDevices">
                Desconectar sessões
              </v-btn>
            </div>
          </v-card>

        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { http } from '@/functions/'
import type { DeviceData } from '"@projeto/types"'

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
const fileInput = ref(null)
const localProfilePic = ref(null)
const activeTab = ref('personal')
const connectedDevices = ref<Session[] | null>(null)

const navItems = [
  { id: 'home', text: 'Início', icon: 'home', color: 'primary' },
  { id: 'personal', text: 'Informações pessoais', icon: 'assignment_ind', color: 'secondary' }, // ou 'badge'
  { id: 'security', text: 'Segurança', icon: 'lock', color: 'error' },
  { id: 'data', text: 'Dados e privacidade', icon: 'grid_view', color: 'success' },
]

const currentTabTitle = computed(() => {
  const item = navItems.find(i => i.id === activeTab.value)
  return item ? item.text : 'Configurações'
})

const currentTabDescription = computed(() => {
  switch (activeTab.value) {
    case 'personal': return 'Gerencie detalhes que deixam o Google ainda melhor para você e decida quais informações ficam visíveis.'
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
    val: user.getBirthdate,
    format: (val) => formatDate(val)
  },
  {
    key: 'gender',
    label: 'Gênero',
    val: user.getGender || 'Masculino'
  },
  {
    key: 'email',
    label: 'E-mail',
    val: user.email
  },
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

/* Upload de Imagem */
function triggerFileInput() {
  fileInput.value.click()
}

function onFileChange(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async () => {
    localProfilePic.value = reader.result

    // Lógica de salvamento imediato (comum em UX moderna) ou via formulário
    try {
      await http.post({ type: 'database', route: 'updateProfilePic' }, { image: reader.result })
      // user.setProfilePic(reader.result) // Atualiza store
      alert('Foto atualizada!')
    } catch (err) {
      console.error('Erro upload', err)
    }
  }
  reader.readAsDataURL(file)
}

/* Navegação para Edição */
function handleEdit(field) {
  // Opção A: Abrir Dialog (mais comum em SPAs)
  // openEditDialog(field.key)

  // Opção B: Navegar para rota filha
  console.log('Editando:', field.key)
  // router.push({ name: 'EditField', params: { field: field.key } })
}

// Lógica de Segurança (do seu código original)
function disconnectAllDevices() {
  if (!confirm('Desconectar todas as sessões?')) return
  http.auth.logoutAll()
}

const getDeviceIcon = (d: DeviceData) =>
  (d.browser === 'Android' || d.browser === 'iOS')
    ? 'smartphone'
    : 'computer'

</script>

<style scoped>
/* UX Improvements */
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

/* Estado Ativo do Menu */
.v-list-item--active {
  background-color: #e8f0fe !important;
  /* Azul Google Light */
}
</style>
