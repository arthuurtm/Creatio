<template>
  <div v-if="loading" class="feedback-message">Carregando...</div>

  <div v-else-if="error" class="feedback-message">Erro: {{ error }}</div>

  <div class="game-page" v-else>
    <div class="banner-section">
      <div class="game-banner-bg" :style="{ backgroundImage: `url(${banner})` }"></div>

      <div class="banner-overlay">
        <div class="game-content container">
          <div class="game-thumb" v-if="thumb">
            <img :src="thumb" alt="Capa do jogo" />
          </div>

          <div class="game-info">
            <h1 class="game-title">{{ title }}</h1>
            <p class="game-description">
              {{ description }}
            </p>

            <CreateButton
              :buttons="[
                {
                  text: hasSession ? 'Continuar' : 'Jogar',
                  class: 'primary',
                  icon: 'play_arrow',
                  action: () => handlePlay(),
                },
              ]"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="more-content container">
      <h2>Mais Detalhes</h2>
      <p>Aqui você pode adicionar mais seções, como galeria, requisitos do sistema, etc.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { http } from '@/functions'
const route = useRoute()
const loading = ref(true)
const error = ref(null)
const title = ref('Jujutsu Kaisen: Cursed Clash')
const description = ref(
  'Domine a Energia Amaldiçoada! Junte-se a Yuji Itadori, Megumi Fushiguro, Nobara Kugisaki e Satoru Gojo em batalhas épicas para defender a humanidade das maldições.',
)
const banner = ref(
  'https://img.elo7.com.br/product/zoom/46162F3/big-painel-redondo-jujutsu-kaisen-festa-aniversario.jpg',
) // Imagem de exemplo
const thumb = ref(
  'https://image.api.playstation.com/vulcan/ap/rnd/202307/0404/2b8471a47683b32c6999684c30e55b14c337b51f04314441.png',
) // Imagem de exemplo
const hasSession = ref(false)

onMounted(async () => {
  // Seu código para buscar os dados
  try {
    const id = route.params.id
    const res = await http.get({
      type: 'database',
      querys: { id },
      route: 'getGames',
    })
    const game = res[0]
    title.value = game.title
    description.value = game.description
    // banner.value = game.banner
    // thumb.value = game.thumb || '/assets/placeholder-thumb.png'
  } catch (err) {
    error.value = err.message || err
  } finally {
    loading.value = false
  }

  // Simulação de delay para teste
  setTimeout(() => {
    loading.value = false
  }, 500)
})

function handlePlay() {
  console.log(hasSession.value ? 'Continuando sessão...' : 'Iniciando nova sessão...')
}
</script>

<style scoped>
.game-page {
  /* A altura agora é automática, baseada no conteúdo */
  width: 100%;
}

.banner-section {
  position: relative;
  width: 100%;
  height: 65vh; /* Altura do banner, ajuste conforme necessário */
  display: flex;
  align-items: flex-end; /* Alinha o conteúdo na base do banner */
  color: var(--text-color, #f0f0f0);
}

.game-banner-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center 30%; /* Foca um pouco mais na parte de cima da imagem */
  filter: brightness(0.6);
  z-index: 1;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  /* padding-bottom: 4rem; */
  background: linear-gradient(
    to bottom,
    rgba(18, 18, 18, 0) 0%,
    /* Começa transparente */ rgba(18, 18, 18, 0.5) 50%,
    /* Meio termo com alguma cor */ #121212 95% /* Termina na cor de fundo exata da sua página */
  );
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.game-content {
  position: relative;
  display: flex;
  gap: 2.5rem;
  align-items: flex-end;
}

.game-thumb img {
  width: 180px;
  height: 270px;
  object-fit: cover;
  border-radius: 0.75rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.7);
}

.game-info {
  flex: 1;
  max-width: 650px; /* Limita a largura do texto */
}

.game-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
}

.game-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.85);
}

/* O conteúdo que vem DEPOIS do banner */

.more-content {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.feedback-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
}

/* Responsividade */

@media (max-width: 768px) {
  .banner-section {
    height: auto;
    min-height: 80vh;
  }

  .game-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .game-thumb img {
    width: 150px;
    height: 225px;
  }

  .game-title {
    font-size: 2.5rem;
  }

  .game-description {
    font-size: 1rem;
  }
}
</style>
