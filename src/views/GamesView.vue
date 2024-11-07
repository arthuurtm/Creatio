<template>
  <main>
    <div id="top-options">
      <div class="btn" id="back" v-if="!isInIframe">
        <form @submit.prevent="goBack">
          <button id="back-button" class="btn" type="submit" name="action" value="voltar">
            <span class="material-symbols-outlined">{{ userId ? 'house' : 'passkey' }}</span>
          </button>
        </form>
      </div>
      <div class="toggle-dark">
        <label class="switch">
          <input type="checkbox" id="toggle-dark" v-model="darkMode" @change="toggleTheme" />
          <span class="slider"></span>
        </label>
      </div>
    </div>
    <div class="homeTitle">
      <h1>{{ welcomeMessage }}</h1>
    </div>
    <div class="games-grid">
      <div id="title">
        <h3>Jogos disponíveis</h3>
      </div>
      <div id="content">
        <button id="scroll-left" class="btn scroll" @click="scrollLeft">
          <span class="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <div class="window" id="window1" ref="gdWindow">
          <div v-if="games.length > 0">
            <div v-for="game in games" :key="game.version" class="container gameCard">
              <div class="title">
                <p>{{ game.title }}</p>
              </div>
              <div class="banner">
                <img id="banner" :src="`./public/${game.version}/settings/banner.png`" alt="Banner do jogo" />
              </div>
              <div class="uiOptions">
                <div id="play">
                  <form @submit.prevent="playGame(game.version)">
                    <button id="play-button" class="btn" type="submit">
                      <span class="material-symbols-outlined">play_arrow</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            O diretório de jogos não existe.
          </div>
        </div>
        <button id="scroll-right" class="btn scroll" @click="scrollRight">
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
export default {
  data() {
    return {
      games: [],
      userId: sessionStorage.getItem('userId'), // Use o método que você prefere para gerenciar a sessão
      welcomeMessage: '',
      darkMode: false,
      currentGameVersion: '',
      isInIframe: window !== window.top
    };
  },
  created() {
    this.setWelcomeMessage();
  },
  computed: {
    gamesDir() {
      return './path/to/games/directory'; // Defina o diretório correto dos jogos
    }
  },
  methods: {
    setWelcomeMessage() {
      const currentHour = new Date().getHours(); // Pega a hora atual
      if (currentHour >= 5 && currentHour < 12) {
        this.welmsg = "Bom dia";
      } else if (currentHour >= 12 && currentHour < 18) {
        this.welmsg = "Boa tarde";
      } else {
        this.welmsg = "Boa noite";
      }
    },
    goBack() {
      // Lógica para voltar
    },
    toggleTheme() {
      const theme = this.darkMode ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
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
      // Carregar jogos a partir do diretório especificado
      fetch(this.gamesDir)
        .then(response => response.json()) // Supondo que o servidor retorna um JSON
        .then(data => {
          this.games = data; // Ajuste de acordo com o formato de resposta
        })
        .catch(error => console.error('Erro ao carregar jogos:', error));
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
    }
  },
  mounted() {

    this.welcomeMessage = this.userId ? `${sessionStorage.getItem('welMsg')}, ${sessionStorage.getItem('username')}!` : `${sessionStorage.getItem('welMsg')}!`;
    
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
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>