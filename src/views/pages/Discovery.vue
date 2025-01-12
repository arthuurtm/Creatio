<template>
  <div class="main-grid">
    <div class="games-grid">
      <div id="title">
        <b><h3 class="gradient upper" id="main">Jogos disponíveis</h3></b>
      </div>
      <div id="content">
        <button id="scroll-left" class="gamePage btn scroll" @click="scrollLeft">
          <span class="material-symbols-outlined">arrow_back_ios</span>
        </button>

        <div class="window" id="window1" ref="gdWindow">
          <div v-if="games.length > 0" class="window">

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
  </div>
</template>

<script>

export default {
  data() {
    return {
      games: [],
      userId: sessionStorage.getItem('userId'),
    };
  },
  methods: {
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
    },
    loadGames() {
      const url = this.$globalFunc.getApiUrl('database', 'encontrar-jogos');
      
      fetch(url)
        .then(response => {
          if (!response.ok) {
            return response.json().then(errorData => {
              throw new Error(errorData.message || 'Erro desconhecido ao carregar os jogos');
            });
          }
          return response.json(); // Se a resposta for bem-sucedida, retorna os dados
        })
        .then(data => {
          this.games = data; // Armazena os dados no estado
        })
        .catch(error => {
          console.error('Erro ao carregar os jogos:', error.message); // Captura erros de requisição ou outros
          // Aqui você pode fazer algo adicional com o erro, como mostrar uma mensagem para o usuário
        });
    },
  },
  mounted() {
    this.loadGames(); // Carregar jogos ao iniciar o componente
  },
}
</script>

<style scoped>
  @import url('/src/assets/css/modules/discovery.css');
</style>
