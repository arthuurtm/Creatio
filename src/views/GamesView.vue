<template>
  <MainNavigator 
    v-if="isLoggedIn"
    @openModal="OpenModal"
  />
  <!-- <button 
      id="profile-button" 
      class="profile-button" 
      @click="toggleMenu"
  >
      <img 
          :src="profilePicture" 
          alt="Foto de perfil" 
          class="profile-picture-button"
      />
  </button> -->
  <main>
    <div class="homeTitle">
      <h1>{{ welcomeMessage }}</h1>
    </div>
    <div class="games-grid">
      <div id="title">
        <h3>Jogos disponíveis</h3>
      </div>
      <div id="content">
        <button id="scroll-left" class="gamePage btn scroll" @click="scrollLeft">
          <span class="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <div class="window" id="window1" ref="gdWindow">
          <div v-if="games.length > 0">
            <div v-for="game in games" :key="game.id" class="container gameCard">
              <div class="title">
                <p>{{ game.title }}</p>
              </div>
              <div class="banner">
                <img id="banner" :src="`./public/${game.version}/settings/banner.png`" alt="Banner do jogo" />
              </div>
              <div class="uiOptions">
                <div id="play">
                  <form @submit.prevent="playGame(game.version)">
                    <button id="play-button" class="gamePage btn" type="submit">
                      <span class="material-symbols-outlined">play_arrow</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            Nada a mostrar.
          </div>
        </div>
        <button id="scroll-right" class="gamePage btn scroll" @click="scrollRight">
          <span class="material-symbols-outlined">arrow_forward_ios</span>
        </button>
      </div>
    </div>

    <audio ref="audioElement" autoplay loop style="display: none;">
      <source :src="`./public/${currentGameVersion}/settings/ambient.ogg`" type="audio/ogg">
      Seu navegador não suporta o elemento de áudio.
    </audio>
  </main>
</template>

<script>
import axios from 'axios';
import Header from '@/components/Header.vue';
import MainNavigator from '@/components/MainNavigator.vue';
import { isAuthenticated } from '@/utils/auth';

export default {
  data() {
    return {
      games: [],
      userId: sessionStorage.getItem('userId'), // Use o método que você prefere para gerenciar a sessão
      welcomeMessage: '',
      darkMode: false,
      currentGameVersion: '',
      isInIframe: window !== window.top,
      isLoggedIn: false,
      profilePicture: '/src/assets/img/default/user-data/profile.png',
    };
  },
  components: {
    Header,
    MainNavigator
  },
  created() {
    this.setWelcomeMessage();
    this.checkAuthentication();
  },
  methods: {
    setWelcomeMessage() {
      const currentHour = new Date().getHours(); // Pega a hora atual
      if (currentHour >= 5 && currentHour < 12) {
        this.welcomeMessage = "Bom dia";
      } else if (currentHour >= 12 && currentHour < 18) {
        this.welcomeMessage = "Boa tarde";
      } else {
        this.welcomeMessage = "Boa noite";
      }
    },
    goBack() {
      // Lógica para voltar
    },
    checkAuthentication() {
      this.isLoggedIn = isAuthenticated();
    },
    scrollLeft() {
      this.$refs.gdWindow.scrollBy({
        top: 0,
        left: -200,
        behavior: 'smooth'
      });
    },
    scrollRight() {
      this.$refs.gdWindow.scrollBy({
        top: 0,
        left: 200,
        behavior: 'smooth'
      });
    },
    playGame(gameVersion) {
      this.currentGameVersion = gameVersion;
      // Lógica para jogar o jogo, como enviar uma solicitação para iniciar o jogo
    },
    loadGames() {
      axios.get(this.$globalFunc.getCompleteUrl(window.location.host, 3000, 'encontrar-jogos')) // Ajuste a URL conforme necessário
        .then(response => {
          this.games = response.data; // Supondo que a resposta seja uma lista de jogos
        })
        .catch(error => {
          console.error('Erro ao carregar jogos:', error);
        });
    },
    handleMessage(event) {
      if (event.data.theme) {
        document.documentElement.setAttribute('data-theme', event.data.theme);
      }
    },
    playAudio() {
      const audioElement = this.$refs.audioElement;
      audioElement.play()
        .then(() => {
          console.log('Reprodução automática permitida.');
        })
        .catch((error) => {
          console.log('Reprodução automática bloqueada:', error);
        });
    },
  },
  mounted() {
    this.welcomeMessage = this.userId ? `${sessionStorage.getItem('welMsg') || 'Bem-vindo'}, ${sessionStorage.getItem('username') || 'Usuário'}!` : `${sessionStorage.getItem('welMsg') || 'Bem-vindo'}!`;
    
    if (this.isInIframe) {
      console.log("Esta página está dentro de um iframe.");
      // Lógica para remover botões, se necessário
    }
    
    window.addEventListener('message', this.handleMessage);
    this.loadGames(); // Carregar jogos ao iniciar o componente
    this.playAudio(); // Tentar reproduzir o áudio
  },
  beforeDestroy() {
    window.removeEventListener('message', this.handleMessage);
  }
};
</script>

<style scoped>
  @import url('/src/assets/css/modules/gamesPage.css');
</style>

<style>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
  }
</style>
