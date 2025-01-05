<template>
    <MainNavigator 
        @navigateTo="handleNavigate"
        @openOverlayModal="OpenModal"
    />
    <main>
        <component v-if="currentPage" :is="currentPage"></component>
    </main>
</template>

<script>
import MainNavigator from '@/components/MainNavigator.vue';
import Pages from '@/views/pages';

export default {
    data() {
        return {
            currentPage: "Background",
        };
    },
    components: {
        MainNavigator,
    },
    methods: {
        handleNavigate({ page }) {
            console.log("(handleNavigate) > ", page);
            this.currentPage = Pages[page] || null;
        },
        OpenModal(modalData) {
            this.$emit('openOverlayModal', modalData);
        },
    },
};
</script>

<style>
    main {
        position: relative;
        grid-template-columns: 1fr;
        width: 100%;
        height: 100%;
        max-width: 200%;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
    }
    video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw; /* Largura igual ao viewport */
        height: 100vh; /* Altura igual ao viewport */
        object-fit: cover; /* Ajusta a proporção do vídeo preenchendo a tela */
        z-index: -1; /* Coloca o vídeo atrás de outros elementos */
    }
</style>
