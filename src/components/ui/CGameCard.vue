<template>
  <div
    class="game-card group"
    :class="[size, { 'has-banner': item?.bannerImages && item.bannerImages.length > 0 }]"
    @click="$emit('click', $event)"
    ref="card"
  >
    <!-- Área do Banner (visível por padrão, muda no hover) -->
    <div v-if="item?.bannerImages && item.bannerImages.length > 0" class="banner-area">
      <!-- Imagem principal ou carrossel se tiver várias --><img
        :src="item.bannerImages[currentBannerIndex]"
        :alt="item.title"
        class="banner-image"
        v-if="item.bannerImages[currentBannerIndex]"
      />
      <div v-else class="banner-placeholder">
        <span class="material-symbols-outlined">image_not_supported</span>
      </div>

      <!-- Indicadores de Carrossel (se houver mais de uma imagem) -->
      <div v-if="item.bannerImages.length > 1" class="banner-indicators">
        <span
          v-for="(img, index) in item.bannerImages"
          :key="index"
          class="indicator"
          :class="{ active: index === currentBannerIndex }"
          @click.stop="currentBannerIndex = index"
        ></span>
      </div>

      <!-- Overlay escuro para melhorar legibilidade do título -->
      <div class="banner-overlay"></div>
    </div>

    <!-- Conteúdo principal (sempre visível no topo do card) -->
    <div class="main-content">
      <div class="header">
        <div class="status-wrapper">
          <button class="star" :class="{ active: item?.isStarred }" @click.stop>
            <span class="material-symbols-outlined">star</span>
          </button>
          <div class="status" :class="statusClass">
            {{ statusLabel }}
          </div>
        </div>
      </div>

      <h3 class="title">{{ item?.title }}</h3>
    </div>

    <!-- Detalhes expandidos no hover (inspirado na Steam) -->
    <div class="expanded-details">
      <p class="description">{{ item?.description }}</p>

      <div class="tags-wrapper" v-if="item?.tags && item.tags.length > 0">
        <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>

      <div class="metrics">
        <div class="metric">
          <span class="material-symbols-outlined">visibility</span>
          {{ item?.views?.toLocaleString?.() ?? 0 }}
        </div>
        <div class="metric">
          <span class="material-symbols-outlined">schedule</span>
          {{ formatDate(item?.updatedAt) }}
        </div>
      </div>

      <div class="actions">
        <CButton variant="confirm" @click.stop>
          <span class="material-symbols-outlined">edit</span>
          Editar
        </CButton>
        <CButton variant="destructive" @click.stop>
          <span class="material-symbols-outlined">delete</span>
        </CButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  item: Object,
  size: String, // 'small', 'medium', 'large' - para controle de tamanho geral
})

defineEmits(['click'])

const card = ref(null)
const currentBannerIndex = ref(0)
let bannerInterval = null

// Mapeamento de status (mantido)
const statusMap = {
  draft: { label: 'Rascunho', color: 'amber' },
  published: { label: 'Publicado', color: 'emerald' },
  archived: { label: 'Arquivado', color: 'slate' },
}

const statusClass = computed(() => `status-${statusMap[props.item?.status]?.color ?? 'slate'}`)
const statusLabel = computed(() => statusMap[props.item?.status]?.label ?? 'Desconhecido')

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

// Lógica para o carrossel de banners
watch(
  () => props.item?.bannerImages,
  (newImages) => {
    // Resetar índice e intervalo se as imagens mudarem
    currentBannerIndex.value = 0
    clearInterval(bannerInterval)
    if (newImages && newImages.length > 1) {
      startBannerCycle()
    }
  },
  { immediate: true }, // Executar imediatamente para configurar o carrossel inicial
)

function startBannerCycle() {
  if (props.item?.bannerImages && props.item.bannerImages.length > 1) {
    bannerInterval = setInterval(() => {
      currentBannerIndex.value = (currentBannerIndex.value + 1) % props.item.bannerImages.length
    }, 3000) // Troca a cada 3 segundos
  }
}

// Parar o carrossel quando o mouse sai do card
function stopBannerCycle() {
  clearInterval(bannerInterval)
}

// Efeito 3D ao mover o mouse (adaptado para o novo layout)
function handleMouseMove(e) {
  if (!card.value || props.item?.bannerImages?.length === 0) return // Desabilita 3D se tiver banner
  const rect = card.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const rotateX = -(y - centerY) / 15
  const rotateY = (x - centerX) / 15
  card.value.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`

  // Reiniciar o carrossel no mouse move
  if (props.item?.bannerImages && props.item.bannerImages.length > 1) {
    stopBannerCycle()
    startBannerCycle()
  }
}

function handleMouseLeave() {
  if (!card.value) return
  card.value.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)'
  stopBannerCycle() // Parar o carrossel ao sair
}
</script>

<style scoped>
.game-card {
  position: relative;
  /* overflow: hidden; */
  background-color: var(--bg2);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-medium);
  border-radius: 1rem;
  padding: 1rem; /* Padding base, pode ser ajustado pelos tamanhos */
  transition: all 0.3s ease;
  cursor: pointer;
  transform-style: preserve-3d;
  display: flex;
  flex-direction: column; /* Para organizar o conteúdo verticalmente */
  align-items: flex-start; /* Alinha o conteúdo à esquerda */
  text-align: left; /* Garante que o texto comece à esquerda */
  min-height: 250px; /* Altura mínima para o card */
  justify-content: space-between; /* Empurra o conteúdo para cima e os detalhes para baixo no hover */
}

/* Ajustes de tamanho geral */
.game-card.small {
  width: 200px;
  min-height: 180px;
}
.game-card.medium {
  width: 280px;
  min-height: 250px;
}
.game-card.large {
  width: 380px;
  min-height: 320px;
}

/* Estilo para quando há banner, o padding base é menor para dar espaço à imagem */
.game-card.has-banner {
  padding: 0;
}

.game-card:hover {
  border-color: var(--primary-hover);
  box-shadow: var(--shadow-large); /* Sombra maior no hover */
  transform: scale(1.05); /* Um leve scale no hover */
  z-index: 10; /* Para o card "flutuar" acima dos outros */
}

/* Área do Banner */
.banner-area {
  position: relative;
  width: 100%;
  height: 150px; /* Altura fixa para o banner */
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  overflow: hidden;
  margin-bottom: 0.5rem; /* Espaço entre o banner e o título */
  flex-shrink: 0; /* Impede o banner de encolher */
}
.game-card.medium .banner-area {
  height: 180px;
}
.game-card.large .banner-area {
  height: 220px;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.3s ease;
}

.banner-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-alt);
  color: var(--secondary);
  font-size: 3rem;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent 50%);
}

.banner-indicators {
  position: absolute;
  bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.4rem;
  z-index: 2; /* Acima do overlay */
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.indicator.active {
  background-color: white;
  transform: scale(1.2);
}

/* Conteúdo Principal (sempre visível) */
.main-content {
  padding: 0 1rem 1rem 1rem; /* Padding lateral e inferior */
  width: 100%;
  box-sizing: border-box;
}

.game-card.has-banner .main-content {
  padding-top: 0.5rem; /* Menos padding superior se tiver banner */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem; /* Menor margem */
}

.icon-wrapper {
  width: 48px; /* Ligeiramente menor para se adequar ao novo layout */
  height: 48px;
  border-radius: 0.75rem;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0; /* Impede o ícone de encolher */
}

.icon-wrapper .material-symbols-outlined {
  font-size: 1.8rem;
}

.status-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.star {
  background: none;
  border: none;
  padding: 0.2rem; /* Adicionado um pouco de padding para área de clique */
  color: var(--secondary);
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 1.2rem;
}
.star.active,
.star:hover {
  color: #facc15;
}

.status {
  padding: 0.2rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid transparent;
  white-space: nowrap; /* Impede quebrar a linha */
}

/* Estilos de status mantidos */
.status-amber {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.3);
}
.status-emerald {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border-color: rgba(16, 185, 129, 0.3);
}
.status-slate {
  background: rgba(100, 116, 139, 0.2);
  color: #cbd5e1;
  border-color: rgba(100, 116, 139, 0.3);
}

.title {
  color: var(--text);
  font-weight: 700;
  font-size: 1.3rem; /* Tamanho do título para o layout principal */
  margin-bottom: 0; /* Margem ajustada */
  line-height: 1.3;
  transition: color 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limita o título a 2 linhas */
  -webkit-box-orient: vertical;
}

/* Detalhes Expandidos (visíveis apenas no hover) */
.expanded-details {
  position: absolute;
  top: 100%; /* Começa abaixo do card */
  left: 0;
  width: 100%;
  /* background-color: var(--background-alt); */
  background-color: var(--bg2); /* Usa bg2 para consistência */
  border: 1px solid var(--primary-hover); /* Borda mais forte no hover */
  border-radius: 0 0 1rem 1rem;
  padding: 1rem;
  box-shadow: var(--shadow-large);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px); /* Começa um pouco para cima */
  transition: all 0.3s ease-out;
  z-index: 9; /* Abaixo do card "pai" se ele tiver z-index 10 */
  box-sizing: border-box;
}

.game-card:hover .expanded-details {
  opacity: 1;
  visibility: visible;
  transform: translateY(0); /* Desliza para a posição */
  /* Ajusta a posição para que o card se expanda para baixo */
  top: calc(100% - 1px); /* -1px para sobrepor a borda do card principal */
}

.description {
  color: var(--secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
  max-height: 70px; /* Limita a altura da descrição */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4; /* Limita a descrição a 4 linhas */
  -webkit-box-orient: vertical;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background-color: var(--input-bg);
  color: var(--input-text);
  padding: 0.3rem 0.7rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  white-space: nowrap;
}

.metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--secondary);
  margin-bottom: 1rem;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.metric .material-symbols-outlined {
  font-size: 1rem;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: flex-end; /* Alinha os botões à direita */
}

/* Quando o card tem banner, o efeito 3D é desativado para não conflitar com a animação */
.game-card.has-banner:hover {
  transform: scale(1.05); /* Mantém o scale */
}

.game-card.has-banner:hover,
.game-card.has-banner {
  transform: none !important; /* Desativa a transformação 3D */
}
</style>
