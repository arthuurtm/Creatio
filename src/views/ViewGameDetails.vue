<template>
  <div>
    <h1>Game ID: {{ id }}</h1>
  </div>
</template>

<script>
export default {
  name: 'ViewGameRun',
  props: {
    id: {
      type: String,
      required: true,
    }
  },
  mounted() {
    console.log(`Game ID recebido: ${this.id}`);
  }
};
</script>
