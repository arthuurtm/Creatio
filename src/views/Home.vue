<template>
    <div class="grid-container">
        <MainNavigator 
            @navigateTo="handleNavigate"
        />
        <main>
            <component v-if="currentPage" :is="currentPage"></component>
        </main>
    </div>
</template>

<script>
import MainNavigator from '@/components/MainNavigator.vue';
import Pages from '@/views/pages';

export default {
    data() {
        return {
            currentPage: "Discovery",
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
    },
};
</script>

<style>
    .grid-container {
        display: grid;
        grid-template-columns: auto auto; /* 'auto' adapta ao tamanho do p1s */
        grid-template-rows: 1fr; /* Uma única linha */
        height: 100%; /* Ocupa toda a altura da viewport */
        width: 100%;
    }

    .grid-container:has(.p1s.hidden) {

    }
</style>