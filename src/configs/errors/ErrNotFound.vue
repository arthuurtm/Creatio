<template>
  <main>
    <div class="separador">
      <div class="separador">
        <div class="container">
          <div class="bubble right">{{ this.msgText }}</div>
          <div class="bubble left">👽 bilu???</div>
        </div>
        <div class="container text-container">
          <h1>Algo de errado parece não estar certo... <i>Erro 404</i></h1>
          <h2>Essa página não existe</h2>
          <form method="POST" @submit.prevent="back">
            <button class="btn" type="submit">Voltar</button>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  Name: 'NotFound',
  data() {
    return {
      msgText: window.location.pathname,
      maxLength: 20,
    }
  },
  mounted() {
    const truncatedText = this.truncateText(this.msgText, this.maxLength)
    document.getElementById('message-text').textContent = truncatedText
  },
  methods: {
    truncateText(text, maxLength) {
      if (text.length > maxLength) {
        return text.substring(0, maxLength - 3) + '...'
      } else {
        return text
      }
    },
    back() {
      this.$globalFunc.hrefTo('/')
    },
  },
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
  flex: 1;
  box-sizing: border-box;
  margin: 30px;
}

.text-container {
  text-align: left;
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
