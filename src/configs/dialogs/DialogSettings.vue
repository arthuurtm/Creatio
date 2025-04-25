<template>
  <div class="container">
    <nav class="nav">
      <ul>
        <li>
          <a @click="handleNavPage(1, 'Geral')">
            <span class="material-symbols-outlined notranslate">settings</span>
            <p>Geral</p>
          </a>
        </li>
        <li>
          <a @click="handleNavPage(2, 'Conta')" v-if="isAuth">
            <span class="material-symbols-outlined notranslate">account_circle</span>
            <p>Conta</p>
          </a>
        </li>
        <li>
          <a @click="handleNavPage(3, 'Segurança')" v-if="isAuth">
            <span class="material-symbols-outlined notranslate">Security</span>
            <p>Segurança</p>
          </a>
        </li>
      </ul>
    </nav>
    <div class="navPage">
      <form @submit.prevent="handleAction">
        <div class="pageContainer" :class="actualPage == 1 && 'active'">
          <ul>
            <li>
              <p>Tema Escuro</p>
              <label class="switch">
                <input type="checkbox" @change="toggleTheme" v-model="isDarkMode" />
                <span class="slider"></span>
              </label>
            </li>
          </ul>
        </div>

        <div class="pageContainer" :class="actualPage == 2 && 'active'">
          <ul>
            <li>
              <p>Foto de Perfil</p>
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
          </ul>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { appTheme, get } from '@/functions/functions'
import { computed, ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'

// Stores e router
const route = useRoute()
const store = inject('stores')

const isAuth = computed(() => store.user.getIsAuth)
const profilePicture = computed(() => store.user.getProfilePicture)
const selectedOption = ref(null)
const actualPage = ref(1)
const isDarkMode = ref(false)
const isGoogleConnected = ref(false)
const isDiscordConnected = ref(false)
const userData = ref({})

function handleNavPage(value, name) {
  actualPage.value = value
  selectedOption.value = name ?? null
}

function handleAction() {}

function toggleTheme() {
  console.log(appTheme(true))
}

function handleExtLink(name, params) {
  if (params) params = {}
  route.push({
    name,
    params,
  })
  close()
}

function close() {
  store.dialog.close()
}

onMounted(() => {
  let theme = appTheme()
  isDarkMode.value = theme.isDark == true ? true : false

  const gToken = get({ type: 'database', route: 'getUserBasics' })
  if (gToken.ok) {
    let data = gToken.json()
    if (data.gToken != '' || data.gToken != null) {
      isGoogleConnected.value = true
      userData.value = data
    }
  }
})
</script>

<style scoped>
@import url('/src/assets/css/components/c-dialogSettings.css');
</style>
