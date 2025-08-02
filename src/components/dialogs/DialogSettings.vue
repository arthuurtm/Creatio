<template>
  <div class="container">
    <nav class="nav">
      <ul>
        <CreateButton
          :globalStyle="'justify-start'"
          :rules="['noGroup']"
          :buttons="[
            {
              id: 1,
              text: 'Geral',
              icon: 'settings',
              class: 'symbolic',
              action: () => handleNavPage(1, 'Geral'),
            },
            {
              id: 2,
              text: 'Conta',
              icon: 'account_circle',
              class: 'symbolic',
              action: () => handleNavPage(2, 'Conta'),
              rules: [!isAuth && 'hide'],
            },
            {
              id: 3,
              text: 'Segurança',
              icon: 'security',
              class: 'symbolic',
              action: () => handleNavPage(3, 'Segurança'),
              rules: [!isAuth && 'hide'],
            },
          ]"
        />
      </ul>
    </nav>
    <div class="navPage">
      <form @submit.prevent="handleAction">
        <div class="pageContainer" :class="actualPage == 1 && 'active'">
          <ul>
            <li>
              <p>Tema escuro</p>
              <label class="switch">
                <input type="checkbox" @change="toggleThemeColor" v-model="isDarkMode" />
                <span class="slider"></span>
              </label>
            </li>
            <li>
              <p>Tema moderno</p>
              <label class="switch">
                <input type="checkbox" @change="toggleThemeGlassy" v-model="isGlassy" />
                <span class="slider"></span>
              </label>
            </li>
            <li>
              <p>Menu lateral</p>
              <label class="switch">
                <input type="checkbox" @change="toggleSideBar" v-model="settings.getSideBar" />
                <span class="slider"></span>
              </label>
            </li>
          </ul>
        </div>

        <div class="pageContainer" :class="actualPage == 2 && 'active'">
          <ul>
            <li>
              <p>Foto de perfil</p>
              <a>
                <img :src="profilePicture" alt="Foto de perfil" class="profile-picture" />
              </a>
            </li>
            <li>
              <p>Conta Google</p>
              <a v-if="isGoogleConnected">
                <p>{{ userData.email }}</p>
              </a>
              <a v-else class="btn symbolic">
                <span class="material-symbols-outlined notranslate"> arrow_outward </span>
              </a>
            </li>
            <li>
              <p>Conta Discord</p>
              <a v-if="isDiscordConnected">
                <p>{{ userData.email }}</p>
              </a>
              <a v-else class="btn symbolic">
                <span class="material-symbols-outlined notranslate"> arrow_outward </span>
              </a>
            </li>
          </ul>
        </div>

        <div class="pageContainer" :class="actualPage == 3 && 'active'">
          <ul>
            <li>
              <p>Alterar senha</p>
              <a class="btn symbolic" @click="handleExtLink('PasswordRescue')">
                <span class="material-symbols-outlined notranslate"> arrow_outward </span>
              </a>
            </li>
            <li>
              <p>Dispositivos conectados</p>
              <a class="btn symbolic" @click="handleNavPage(3.1, 'Dispositivos')">
                <span class="material-symbols-outlined notranslate"> visibility </span>
              </a>
            </li>
          </ul>
        </div>

        <div class="pageContainer" :class="actualPage == 3.1 && 'active'">
          <CreateButton
            :buttons="[
              {
                text: 'Desconectar todos',
                position: 'center',
              },
            ]"
            @emitEvent="disconnectAllDevices"
          />
          <ul class="devices">
            <li class="device">
              <div><b>Nome do dispositivo</b></div>
              <p><b>Online</b></p>
            </li>
            <li v-for="(device, index) in connectedDevices" :key="index" class="device">
              <div>
                <div
                  v-if="device.deviceOS === 'Android' || device.deviceOS === 'iOS'"
                  class="material-symbols-outlined notranslate"
                >
                  smartphone
                </div>
                <div v-else class="material-symbols-outlined notranslate">computer</div>
                <p>
                  {{ device.deviceNavigator }} no {{ device.deviceOS }}
                  <!-- {{ itsMe(device) && '(Você)' }} -->
                </p>
              </div>
              <p>
                {{
                  new Date(device.updatedAt).toLocaleString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                }}
              </p>
            </li>
          </ul>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { appTheme, get } from '@/functions'
import { logoutAll } from '@/functions/auth'
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CreateButton from '../elements/CreateButton.vue'
import { useAppDynamicDialog, useUserStore, useSettingsStore } from '@/stores'
import DialogMessage from './DialogMessage.vue'

// Stores e router
const router = useRouter()
const user = useUserStore()
const dialog = useAppDynamicDialog()
const settings = useSettingsStore()

const isAuth = computed(() => user.getIsAuth)
const userId = computed(() => user.getId)
const profilePicture = computed(() => user.getProfilePicture)
const selectedOption = ref(null)
const actualPage = ref(1)
const isDarkMode = ref(false)
const isGlassy = ref(false)
const isGoogleConnected = ref(false)
const isDiscordConnected = ref(false)
const userData = ref({})
const isSideBarEnable = computed(() => settings.getSideBar)

function handleNavPage(value, name) {
  actualPage.value = value
  selectedOption.value = name ?? null
  document.getElementById(1).classList.add('selected')
}

function handleAction() {}

function toggleThemeColor() {
  appTheme(true)
}

function toggleThemeGlassy() {
  appTheme(false, true)
}

function toggleSideBar() {
  settings.setSideBar(!isSideBarEnable.value)
}

function handleExtLink(name, params) {
  if (params) params = {}
  router.push({
    name,
    params,
  })
  dialog.close()
}

function disconnectAllDevices() {
  dialog.setDialog(DialogMessage, {
    title: 'Desconectar outras sessões',
    message: 'Você tem certeza que deseja desconectar todas as outras sessões?',
    buttons: [
      {
        text: 'Não',
      },
      {
        text: 'Sim',
        class: 'confirm',
        action: () => {
          logoutAll()
        },
      },
    ],
  })
}

const itsMe = (device) => {
  if (userId.value === device.userId) {
    return true
  }
  return false
}

const connectedDevices = ref([])

onMounted(async () => {
  let theme = appTheme()
  isDarkMode.value = theme.isDark == true ? true : false
  isGlassy.value = theme.isGlassy == true ? true : false

  const gToken = get({ type: 'database', route: 'getUserBasics' })
  if (gToken.ok) {
    let data = gToken.json()
    if (data.gToken != '' || data.gToken != null) {
      isGoogleConnected.value = true
      userData.value = data
    }
  }

  let result = await get({ type: 'database', route: 'getAllUserSessions' })
  connectedDevices.value = result.details
})
</script>

<style scoped>
.container {
  grid-row: 2;
  display: grid;
  grid-template-columns: 0.5fr 2fr;
  max-height: 60vh;
  overflow-x: hidden;
}

.nav {
  grid-column: 1;
  padding: 15px 20px;
  border-right: 1px solid var(--border);
}

.nav ul {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav a {
  display: flex;
  flex-direction: row;
  gap: 5px;
  cursor: pointer;
}

.nav a p {
  text-decoration: none;
  font-weight: bold;
  font-size: 16px;
}

.nav a:hover {
  color: var(--mh-options-hover);
}

.nav a span {
  margin-top: 3px;
  font-size: 24px;
}

.navPage {
  grid-column: 2;
  height: auto;
  padding: 15px;
  color: var(--text);
  font-size: 16px;
  display: flex;
  justify-content: center;
  overflow-y: auto;
  /* border-left: 1px solid var(--border); */
}

form,
.pageContainer,
.pageContainer .ul {
  width: 100%;
  height: auto;
}

.pageContainer {
  display: none;
}

.pageContainer.active {
  display: block;
}

/* Estilização de li */
li {
  display: block;
  width: 100%;
}

li:last-child {
  border-bottom: none;
}

.nav a {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  width: 100%;
  text-decoration: none;
  padding: 10px;
  border-radius: 8px;
}

.nav a:hover {
  background-color: var(--bg-hover);
}

.navPage ul li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

img.profile-picture {
  width: 30px;
  height: auto;
  padding: 10px;
  border-radius: 50%;
}

ul.devices li > div {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
}

ul.devices li > p {
  font-size: 16px;
  text-align: end;
}

@media (max-width: 600px) {
  .container {
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: 1fr;
    margin-bottom: 10px;
    height: auto;
    interpolate-size: allow-keywords;
    overflow-y: auto;
    max-height: 100%;
  }

  .navPage {
    grid-column: 1;
    grid-row: 1;
    max-height: 70vh;
  }

  .nav {
    border-right: none;
    border-top: 1px solid var(--border);
    grid-column: 1;
    grid-row: 2;
    padding: 0;
    /* position: absolute; */
    bottom: 0;
    width: 100%;
    background-color: var(--bg);
  }

  .nav ul {
    gap: 0;
    flex-direction: row;
  }

  ul {
    display: flex;
    flex-direction: row;
    overflow-x: scroll;
  }

  a {
    padding: 0;
  }

  .pageContainer ul {
    flex-direction: column;
  }
}
</style>
