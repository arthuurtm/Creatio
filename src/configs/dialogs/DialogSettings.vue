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
        <div class="pageContainer" :class="this.actualPage == 1 && 'active'">
          <ul>
            <li>
              <p>Tema Escuro</p>
              <label class="switch">
                <input type="checkbox" @change="toggleTheme" v-model="isDarkMode">
                <span class="slider"></span>
              </label>
            </li>
          </ul>
        </div>

        <div class="pageContainer" :class="this.actualPage == 2 && 'active'">
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
                <p> {{ this.userData.email }} </p>
              </a>
              <a v-else class="btn symbolic">
                <span class="material-symbols-outlined notranslate">
                  arrow_outward
                </span>
              </a>
            </li>
            <li>
              <p>Conta Discord</p>
              <a v-if="isDiscordConnected">
                <p> {{ this.userData.email }} </p>
              </a>
              <a v-else class="btn symbolic">
                <span class="material-symbols-outlined notranslate">
                  arrow_outward
                </span>
              </a>
            </li>
          </ul>
        </div>

        <div class="pageContainer" :class="this.actualPage == 3 && 'active'">
          <ul>
            <li>
              <p>Alterar senha</p>
              <a class="btn symbolic" @click="handleExtLink('PasswordRescue')">
                <span class="material-symbols-outlined notranslate">
                  arrow_outward
                </span>
              </a>
            </li>
          </ul>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { appTheme, getApiUrl } from '@/functions/functions';
import { useAppDynamicDialog, useUserStore } from '@/stores/store';
import { computed } from 'vue';
export default {
  name: 'DialogSettings',
  inject: ['userStore'],

  setup() {
    const settingsPanelStore = useAppDynamicDialog();

    // Propriedade computada para isVisible
    const isVisible = computed(() => settingsPanelStore.isVisible);

    const userStore = useUserStore();
    const isAuth = computed(() => userStore.isAuth);
    const profilePicture = computed(() => userStore.profilePicture);

    return {
      isAuth,
      isVisible, // Estado reativo
      close: settingsPanelStore.hide, // Ação para esconder o painel
      profilePicture,
    };
  },

  data() {
    return {
      selectedOption: null,
      actualPage: 0,
      isDarkMode: false,
      isGoogleConnected: false,
      isDiscordConnected: false,
      userData: {},
    }
  },
  async mounted() {
    this.actualPage = 1;
    let theme = appTheme();
    this.isDarkMode = theme.isDark == true ? true : false;
    window.addEventListener('keydown', this.close);

    const gToken = fetch(getApiUrl('database', 'getUserBasics'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (gToken.ok) {
      let data = gToken.json();
      if (data.gToken != '' || data.gToken != null) {
        this.isGoogleConnected = true;
        this.userData = data;
      }
    }

  },

  methods: {

    handleNavPage(value, name) {
      this.actualPage = value;
      this.selectedOption = name ?? null;
    },

    handleAction() {

    },

    toggleTheme() {
      console.log(appTheme(true));
    },

    handleExtLink(name, params) {
      if (params) params = {};
      this.$router.push(
        {
          name,
          params
        });
      this.close();
    },
  },
}
</script>

<style scoped>
@import url('/src/assets/css/components/c-dialogSettings.css');
</style>
