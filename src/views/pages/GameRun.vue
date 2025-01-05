<template>
    <div>
      <h2>Rodando Jogo com ID: {{ id }}</h2>
      <!-- Aqui você pode adicionar lógica específica para carregar e exibir o jogo com base no ID -->
    </div>
</template>
  
<script>
  export default {
    name: 'GameRun',
    props: ['id'], // Recebe o ID como prop da rota
    mounted() {
      // Você pode usar o ID para buscar dados do jogo de uma API, por exemplo
      console.log(`Carregando o jogo com ID: ${this.id}`);
      // Exemplo: this.fetchGame(this.id);
    },
    methods: {
      fetchGame(id) {
        // Função de exemplo para buscar informações do jogo com o ID fornecido
        // Exemplo de chamada de API:
        // fetch(`/api/games/${id}`)
        //   .then(response => response.json())
        //   .then(data => console.log(data));
      }
    }
  };
</script>
  