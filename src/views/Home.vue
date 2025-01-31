<template>
    <div class="grid-container">
        <div 
            class="focus-element"
            :class="isFocusElement && 'active'"
        ></div>

        <Navigator 
            @navigateTo="handleNavigate"
            @focus="handleFocusElement"
        />

        <div class="game-selector">
        <!-- <transition name="fade"> -->
            <component 
                v-if="currentPage" 
                :is="currentPage"
                v-bind="this.pageParams"
                @navigateTo="handleNavigate"
            ></component>
        <!-- </transition> -->
        </div>

        <div 
            class="overlay"
            :class="currentComponent && 'active'"
        >
            <!-- <transition name="fade"> -->
            <component
                v-if="currentComponent"
                :is="currentComponent"
                v-bind="this.componentParams"
                @closeWindow="this.currentComponent = null"
            ></component>
            <!-- </transition> -->
        </div>
    </div>
</template>

<script>
import Navigator from '@/components/Navigator.vue';
import Pages from '@/views/pages';

export default {
    data() {
        return {
            currentPage: null,
            currentGame: null,
            currentComponent: null,
            componentParams: {},
            pageParams: {},
            focusElement: false,
            isFocusElement: false,
        };
    },
    props: ['gid'],
    mounted() {
        this.handleNavigate({ page: 'Discovery' });
        if (this.gid) {
            this.handleNavigate({ page: 'GameRun', params: { id: this.gid } });
        }
    },
    watch: {
        focusElement(value) {
            value ? this.isFocusElement = true : this.isFocusElement = false;
        },
        currentComponent(value) {
            value ? this.handleFocusElement(true) : this.handleFocusElement(false);
        }
    },
    components: {
        Navigator,
    },
    methods: {
        handleNavigate({ page, params = {} }) {
            console.log("(navigateTo) >", page, params);
            const selectedPage = Pages[page];
            console.log(`TIPO: ${params.typeView}`)
            if (!selectedPage) {
                console.warn(`Página "${page}" não encontrada em Pages.`);
                this.currentPage = null;
                return;
            }
            if (params.typeView === 'popup') {
                this.currentComponent = selectedPage;
                this.componentParams = params;

            } else {
                this.currentPage = selectedPage;
                this.pageParams = params;
            }
        },
        handleFocusElement(value) {
            value ? this.focusElement = true : this.focusElement = false;
        },
    },
};
</script>


<style scoped>
    .grid-container {
        display: grid;
        grid-template-columns: auto auto; /* 'auto' adapta ao tamanho do p1s */
        grid-template-rows: 1fr; /* Uma única linha */
        height: 100%;
        width: 100%;
        position: relative;
    }
    .app.pc .game-selector {
        display: grid;
        grid-column: 2;
        width: 100%;
        height: 100%;
        animation: moveToLeft 1s ease-in-out forwards;
    }
    .app.pc .game-run {
        display: grid;
        grid-column: 3;
        width: 100%;
        height: 100%;
        animation: moveToLeft 1s ease-in-out forwards;
    }
    .app.mobile .grid-container {
        display: unset;
    }
    .fade-enter-active, .fade-leave-active {
        transition: opacity 0.3s ease;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }
    .focus-element {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--overlay-bg);
        visibility: hidden;
        opacity: 0;
    }
    .focus-element.active {
        visibility: visible;
        opacity: 1;
        z-index: 6;
    }
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 1;
        z-index: -1;
    }
    .overlay.active {
        z-index: 6;
    }
    @keyframes moveToLeft {
        from {
            transform: translateX(100%);
        } to {
            transform: translateX(0);
        }
    }
</style>