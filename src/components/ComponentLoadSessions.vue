<template>
  <div class="games-grid">
    <div class="discovery" v-for="(window, index) in windows" :key="index" :id="'d_' + index">
      <div class="title">
        <b>
          <h3 class="gradient upper">Jogos disponíveis</h3>
        </b>
      </div>
      <div class="content">
        <button class="btn symbolic scroll" @click="scroll(index, 'left')">
          <span class="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <div v-if="games.length > 0" class="window" :id="'w_' + index" :ref="'windowRefs_' + index">
          <div v-for="game in games" :key="game.id" class="container gameCard">
            <div class="title">
              <p>{{ game.title }}</p>
            </div>

            <div class="banner">
              <img
                id="banner"
                :src="`./public/${game.version}/settings/banner.png`"
                alt="Banner do jogo"
              />
            </div>

            <div class="uiOptions">
              <div id="play">
                <form @submit.prevent="playGame(game.version)">
                  <button id="play-button" class="btn symbolic" type="submit">
                    <span class="material-symbols-outlined">play_arrow</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div v-else>Nada a mostrar.</div>
        <button class="btn symbolic scroll" @click="scroll(index, 'right')">
          <span class="material-symbols-outlined">arrow_forward_ios</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ViewGames',

  data() {
    return {
      games: [],
      userId: sessionStorage.getItem('userId'),
      windows: Array(1).fill({}),
    }
  },
  methods: {
    scroll(index, type) {
      console.log(`scroll() > index: ${index}, type: ${type}`)
      const windowRef = this.$refs[`windowRefs_${index}`]
      switch (type) {
        case 'left':
          windowRef[index].scrollBy({
            top: 0,
            left: -200,
            behavior: 'smooth',
          })
          break

        case 'right':
          windowRef[index].scrollBy({
            top: 0,
            left: 200,
            behavior: 'smooth',
          })
          break

        default:
          console.error('scroll() > tipo de scroll desconhecido.')
      }
    },
    playGame(gameVersion) {
      this.$globalFunc.hrefTo(`/run/${gameVersion}`)
    },
    loadGames() {
      this.$globalFunc.get({ type: 'database', route: 'getGames' })
    },
  },
  mounted() {
    this.loadGames() // Carregar jogos ao iniciar o componente
  },
}
</script>

<style scoped>
@import url('/src/assets/css/components/c-loadSessions.css');
</style>
