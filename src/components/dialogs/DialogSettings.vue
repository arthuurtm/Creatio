<template>
  <div class="profile-container">
    <nav class="nav">
      <ul>
        <li
          v-for="(btn, index) in navButtons"
          :key="index"
          :class="['nav-item', { selected: actualPage === btn.id }]"
          @click="handleNavPage(btn.id, btn.text)"
        >
          <span class="material-symbols-rounded notranslate">{{ btn.icon }}</span>
          <p>{{ btn.text }}</p>
        </li>
      </ul>
    </nav>

    <div class="navPage">
      <form @submit.prevent="handleSave" class="form-wrapper">
        <CGroup class="card" v-show="actualPage === 1">
          <template #title>Geral</template>

          <div class="field-row">
            <label>Tema escuro</label>
            <CSwitch v-model="themeDark" />
          </div>

          <div class="field-row">
            <label>Notificações</label>
            <CSelect
              v-model="form.notifications"
              :options="notificationOptions"
              placeholder="Preferência de notificação"
            />
          </div>
        </CGroup>

        <!-- ---- CONTA ---- -->
        <CGroup class="card" v-show="actualPage === 2">
          <template #title>Conta</template>

          <div class="grid">
            <div class="col avatar-col">
              <label class="label">Foto de perfil</label>

              <div class="avatar-preview">
                <img
                  :src="localProfilePic || profilePicture"
                  alt="avatar"
                  class="profile-picture"
                />
              </div>

              <input type="file" accept="image/*" @change="onFileChange" />
              <div class="avatar-actions">
                <CButton text="Remover" variant="ghost" @click="removeAvatar" />
              </div>
            </div>

            <div class="col fields-col">
              <div class="field">
                <label>Nome de usuário</label>
                <CInputText v-model="form.username" placeholder="username" />
              </div>

              <div class="field">
                <label>Apelido</label>
                <CInputText v-model="form.nickname" placeholder="nickname (opcional)" />
              </div>

              <div class="field">
                <label>Email</label>
                <CInputText v-model="form.email" type="email" placeholder="seu@exemplo.com" />
              </div>

              <div class="field">
                <label>Data de nascimento</label>
                <!-- CInputText com type date se suportado -->
                <CInputText v-model="form.birthdate" type="date" />
              </div>

              <div class="actions">
                <CButton text="Salvar alterações" type="submit" />
                <CButton text="Cancelar" variant="ghost" @click="resetForm" />
              </div>
            </div>
          </div>
        </CGroup>

        <!-- ---- SEGURANÇA ---- -->
        <CGroup class="card" v-show="actualPage === 3">
          <template #title>Segurança</template>

          <div class="field-row">
            <label>Alterar senha</label>
            <CButton icon="arrow_outward" text="Alterar senha" @click="goToChangePassword" />
          </div>

          <div class="field-row">
            <label>Dispositivos conectados</label>
            <CButton
              text="Gerenciar sessões"
              variant="ghost"
              @click="handleNavPage(3.1, 'Dispositivos')"
            />
          </div>

          <div class="danger">
            <CButton text="Desativar conta" variant="danger" @click="requestDisableAccount" />
          </div>
        </CGroup>

        <!-- ---- DISPOSITIVOS ---- -->
        <CGroup class="card" v-show="actualPage === 3.1">
          <template #title>Dispositivos conectados</template>

          <div class="center-row">
            <CButton text="Desconectar todos" @click="disconnectAllDevices" />
          </div>

          <ul class="devices">
            <li class="device" v-for="(device, idx) in connectedDevices" :key="idx">
              <div class="device-left">
                <span class="material-symbols-rounded notranslate">
                  {{
                    device.deviceOS === 'Android' || device.deviceOS === 'iOS'
                      ? 'smartphone'
                      : 'computer'
                  }}
                </span>
                <div class="device-info">
                  <b>{{ device.deviceNavigator }} — {{ device.deviceOS }}</b>
                  <small v-if="itsMe(device)">(Este aparelho)</small>
                </div>
              </div>
              <div class="device-right">
                <small>{{ formatDate(device.updatedAt) }}</small>
              </div>
            </li>
            <li v-if="connectedDevices.length === 0">Nenhum dispositivo ativo.</li>
          </ul>
        </CGroup>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, useSettingsStore } from '@/stores'
import { http } from '@/functions/'

/* ===== COMPONENTS QUE NÃO LOCALIZEI (COMENTEI PARA VOCÊ IMPLEMENTAR) ===== */
/* import Toggle2FA from '@/components/ui/Toggle2FA.vue' // (opcional) */
/* import AvatarUploader from '@/components/ui/AvatarUploader.vue' // (opcional) */
/* import DialogConfirm from '@/components/dialogs/DialogConfirm.vue' // (opcional) */

const router = useRouter()
const user = useUserStore()
const settingsStore = useSettingsStore()

const actualPage = ref(1)
const navButtons = [
  { id: 1, text: 'Geral', icon: 'settings' },
  { id: 2, text: 'Conta', icon: 'account_circle' },
  { id: 3, text: 'Segurança', icon: 'security' },
]
const profilePicture = computed(() => user.getProfilePicture || '')
const connectedDevices = ref([])

const form = reactive({
  email: '',
  birthdate: '',
  username: '',
  nickname: '',
  profilePic: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: 'all',
})

const themeDark = computed({
  get: () => settingsStore.darkTheme,
  set: (value) => {
    settingsStore.darkTheme = value
    document.documentElement.setAttribute('data-theme', value ? 'dark' : 'light')
  },
})

const localProfilePic = ref(null)

const notificationOptions = [
  { label: 'Todas', value: 'all' },
  { label: 'Somente importantes', value: 'important' },
  { label: 'Nenhuma', value: 'none' },
]

function handleNavPage(id, name = null) {
  actualPage.value = id
}

/* Carregar dados iniciais do usuário */
async function loadUser() {
  try {
    form.email = user.getEmail ?? ''
    form.username = user.getUsername ?? ''
    form.nickname = user.getNickname ?? ''
    form.birthdate = user.getBirthdate ?? ''
    form.profilePic = user.getProfilePicture ?? ''
    const sessions = await http.get({ type: 'database', route: 'getAllUserSessions' })
    connectedDevices.value = sessions || []
  } catch (err) {
    console.error('loadUser error', err)
  }
}

onMounted(async () => {
  await loadUser()
})

function onFileChange(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    localProfilePic.value = reader.result
    form.profilePic = reader.result
  }
  reader.readAsDataURL(file)
}

function removeAvatar() {
  localProfilePic.value = null
  form.profilePic = null
}

/* Simula checagem se dispositivo é o atual */
function itsMe(device) {
  // TODO: compare com session atual (token) para identificar dispositivo atual
  return false
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

/* ----- AÇÕES de Segurança ---- */
function goToChangePassword() {
  router.push({ name: 'PasswordRescue' })
}

function disconnectAllDevices() {
  if (!confirm('Desconectar todas as sessões?')) return
  http.auth.logoutAll()
}

/* desativar conta (soft delete) */
function requestDisableAccount() {
  if (!confirm('Tem certeza que deseja desativar sua conta?')) return
  http.post({ type: 'database', route: 'disableAccount' }).then(() => {
    http.auth.logout()
  })
}

async function handleSave() {
  try {
    if (!form.email || !form.username) {
      alert('Preencha email e nome de usuário.')
      return
    }

    const payload = {
      email: form.email,
      username: form.username,
      nickname: form.nickname,
      birthdate: form.birthdate,
      profilePic: form.profilePic,
      preferences: {
        language: form.language,
        timezone: form.timezone,
        notifications: form.notifications,
        themeGlassy: form.themeGlassy,
        twoFactorEnabled: form.twoFactorEnabled,
      },
    }

    const res = await http.post({ type: 'database', route: 'updateUser' }, payload)

    if (res && (res.ok || res.success)) {
      // Atualiza store local se quiser
      // TODO: user.setProfile(...) ou refazer fetch
      alert('Alterações salvas com sucesso.')
    } else {
      // fallback
      console.error('save error', res)
      alert('Erro ao salvar as alterações.')
    }
  } catch (err) {
    console.error(err)
    alert('Erro ao salvar alterações.')
  }
}

function resetForm() {
  loadUser()
}
</script>

<style scoped>
.profile-container {
  display: flex;
  gap: 18px;
  width: 100%;
  min-height: 360px;
  align-items: flex-start;
}

/* NAV */
.nav {
  padding: 16px;
  border-right: 1px solid var(--border);
  min-width: 160px;
}
.nav ul {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-muted);
}
.nav-item .material-symbols-rounded {
  font-size: 20px;
}
.nav-item.selected,
.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text);
}

/* PAGE */
.navPage {
  flex: 1;
  padding: 14px;
  overflow-y: auto;
  max-height: 70vh;
  width: 100%;
}
.form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Card básico layout */
.card {
  padding: 12px;
}

/* GRID (avatar + fields) */
.grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 12px;
  align-items: start;
}
.avatar-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
}
img.profile-picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* fields */
.field {
  margin-bottom: 8px;
}
.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

/* actions */
.actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.center-row {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

/* devices list */
.devices {
  list-style: none;
  padding: 0;
  margin: 0;
}
.device {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px dashed var(--border);
}
.device-left {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* responsive */
@media (max-width: 720px) {
  .profile-container {
    flex-direction: column;
  }
  .nav {
    display: flex;
    border-right: none;
    border-bottom: 1px solid var(--border);
    min-width: 100%;
  }
  .grid {
    grid-template-columns: 1fr;
  }
  .navPage {
    max-height: none;
  }
}
</style>
