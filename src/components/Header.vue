<template>
    <div class="h1s" id="h1s">
        <div class="menu active" id="menu">
            <div class="left">
                <a class="menu-link" @click="navigateTo('jogos')" data-section="jogos">
                    <span class="material-symbols-outlined">menu</span>
                </a>
            </div>
            <div class="right">
                <a class="menu-link" @click="navigateTo('jogos')" data-section="jogos">
                    <span class="material-symbols-outlined">menu</span>
                </a>
            </div>
        </div>
    </div>
</template>
  
<script>
    export default {
        name: 'Header',
    };
</script>
  
<style scoped>
    @import "/src/assets/css/modules/header.css";
</style>
  