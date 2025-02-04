<template>
  <!-- <transition name="fade" mode="out-in"> -->
    <router-view/>
  <!-- </transition> -->
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
