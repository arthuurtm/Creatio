<template>
  <!-- <v-app>
    <v-main class="app"> -->
      <router-view/>
    <!-- </v-main>
  </v-app> -->
</template>

<script>
export default {
  name: 'App',

  data: () => ({
    //
  }),

  mounted() {
    this.$globalFunc.appTheme();
  }
}
</script>

<style>
  @import url('/src/assets/css/core/root.css');
</style>
