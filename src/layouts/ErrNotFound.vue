<template>
  <main>
    <div class="separador">
      <div class="separador">
        <div class="container">
          <div class="bubble right" id="message-text">{{ msgText }}</div>
          <div class="bubble left">👽 bilu???</div>
        </div>
        <div class="container text-container">
          <h1>Algo de errado parece não estar certo... <i>Erro 404</i></h1>
          <h2>Essa página não existe</h2>
          <form method="POST" @submit.prevent>
            <CreateButton
              :buttons="[{ text: 'Voltar', position: 'right', class: 'primary' }]"
              @emitEvent="back"
            />
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

const msgText = ref(window.location.pathname)
const maxLength = ref(30)
const router = useRouter()

onMounted(() => {
  const truncatedText = handleTruncateText(msgText.value, maxLength.value)
  document.getElementById('message-text').textContent = truncatedText
})

function handleTruncateText(text, maxLength) {
  if (text.length > maxLength) {
    console.log(text.substring(0, maxLength - 3) + '...')
    return text.substring(0, maxLength - 3) + '...'
  } else {
    return text
  }
}

function back() {
  router.push({ name: 'Home' })
}
</script>

<style scoped>
main {
  max-width: 1600px;
  max-height: 800px;
}

.separador {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
}

.container {
  display: flex;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
  margin: 30px;
  gap: 2rem;
}

.text-container {
  text-align: left;
  gap: 0;
}

.text-container h2 {
  font-weight: normal;
}

.image-container {
  display: flex;
  justify-content: flex-end;
}

.image {
  max-width: 80%;
  height: auto;
  width: 500px;
  animation: rotateImage 10s infinite linear;
  transform-style: preserve-3d;
}

.btn {
  max-width: 50%;
}

@keyframes rotateImage {
  from {
    transform: rotateY(0deg); /* Começa a rotação em 0 graus */
  }
  to {
    transform: rotateY(360deg); /* Completa uma volta em 360 graus */
  }
}

@media (max-width: 800px) {
  .separador {
    display: block;
  }

  .image {
    max-width: 100%;
    width: 100%;
  }

  .container {
    margin: 0px 0px 20px 0px;
  }
}
</style>
