<template>
    <div class="hide-p1s" @click="updateMenuState(true)"><!--☰-->{{ this.navigatorIcon }}</div>
    <div 
        class="p1s"
        :class="[isMenuActive ? 'active' : 'minimized', hidden ? 'hidden' : '']"
        id="p1s"
        ref="menu"
    >
    <div class="p1s-content">
        <div class="user-info" v-if="isAuthenticated">
            <img :src="profilePicture" alt="Foto de perfil" class="profile-picture" />
            <div class="mobile-adaptive-usrInfo">
                <p class="user-name">{{ userStore.name }}</p>
                <p class="user-email">{{ userStore.email }}</p>
            </div>
        </div>
        <div class="invisible-drag-camp" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
            <div class="drag-handle" @click="updateMenuState()" @touchstart.stop></div>
        </div>
        <div class="center">
            <nav class="menu-options">
                <ul>
                    <li v-if="!isAuthenticated" @click="navigateTo('Login')">
                        <a>
                            <span class="material-symbols-outlined notranslate">login</span>
                            <p>Entrar</p>
                        </a>
                    </li>
                    <li v-if="isAuthenticated" @click="navigateTo('Create')">
                        <a>
                            <span class="material-symbols-outlined notranslate">add_circle</span>
                            <p>Criar</p>
                        </a>
                    </li>
                    <li @click="navigateTo('Games')" >
                        <a 
                        class="menu-link" 
                        data-section="jogos"
                        >
                            <span class="material-symbols-outlined notranslate">sports_esports</span>
                            <p>Jogos</p>
                        </a>
                    </li>
                    <li v-if="isAuthenticated" @click="navigateTo('Avatar')" >
                        <a 
                        class="menu-link" 
                        data-section="personagens"
                        >
                            <span class="material-symbols-outlined notranslate">person</span>
                            <p>Personagens</p>
                        </a>
                    </li>
                    <li @click="handleSettigsBox" >
                        <a 
                        class="menu-link" 
                        data-section="configuracoes"
                        >
                            <span class="material-symbols-outlined notranslate">settings</span>
                            <p>Configurações</p>
                        </a>
                    </li>
                    <li v-if="isAuthenticated" @click="handleLogout">
                        <a 
                            id="logoutMenuButton" 
                        >
                            <span class="material-symbols-outlined notranslate">logout</span>
                            <p>Sair</p>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
    </div>
</template>
  
<script>
import { useUserStore } from '@/stores/userData';
import { isAuthenticated, logout } from '@/utils/auth';
export default {
    name: 'Navigator',
    setup() {
        const userStore = useUserStore();
        return {
            userStore,
        };
    },

    data() {
        return {
            startY: 0,
            currentY: 0,
            isDragging: false,
            isMenuActive: false,
            isAuthenticated: false,
            profilePicture: '/src/assets/images/default/user-data/profile.png',
            navigatorIcon: '>',
        };
    },

    props: {
        hidden: Boolean,
    },

    emits: [
        'focus',
        'navigateTo'
    ],

    async mounted() {
        this.isAuthenticated = await isAuthenticated();
        // this.updateMenuState(!(this.handleIsMobile()));
    },

    methods: {

        handleIsMobile() {
            const app = document.getElementById("app");
            const isMobile = app && app.classList.contains('mobile');
            console.log('handleIsMobile() > ', isMobile);
            return isMobile;
        },

        navigateTo(page) {
            console.log(`navigateTo() > page: ${page}`);
            this.$router.push({ name: page })
            this.updateMenuState();
        },

        handleLogout() {
            this.$dialogBox.show({
                title: 'Sair',
                message: 'Você quer mesmo sair?',
                btn1: {
                text: 'Não',
                class: 'btn',
                },
                btn2: {
                text: 'Sim',
                class: 'btn confirm',
                action: () => {
                    logout();
                    window.location.reload();
                },
                },
            });
            this.updateMenuState();
        },

        handleSettigsBox() {
            this.$settingsBox.show();
            this.updateMenuState();
        },

        onTouchStart(event) {
            console.log('onTouchStart');
            this.startY = event.touches[0].clientY;
            this.isDragging = true;
        },

        onTouchMove(event) {
            event.stopPropagation();
            event.preventDefault();
            if (!this.isDragging) return;

            this.currentY = event.touches[0].clientY;
            const translateY = this.currentY - this.startY;

            // Aplica a transformação temporária enquanto o usuário arrasta
            this.$refs.menu.style.transform = `translateY(${translateY}px)`;
        },

        onTouchEnd() {
            if (!this.isDragging) return;
            this.isDragging = false;

            const deltaY = this.currentY - this.startY;

            // Defina o valor mínimo para considerar como mudança de estado
            const activationThreshold = 50;

            if (deltaY < -activationThreshold) {
                // Arrastou para cima
                this.isMenuActive = true;
                this.focus(true);
            } else if (deltaY > activationThreshold) {
                // Arrastou para baixo
                this.isMenuActive = false;
                this.focus(false);
            }

            this.$refs.menu.style.transform = '';
        },

        updateMenuState(force) {
            force = !!force;
            const value = this.handleIsMobile();
            if (value || force) {
                if (this.isMenuActive) {
                    this.isMenuActive = false;
                    value && this.focus(false);
                } else {
                    this.isMenuActive = true;
                    value && this.focus(true);
                }
            }
            console.log('updateMenuState() > ', 
                'isMenuActive: ', this.isMenuActive, 
                ', isMobile: ', value,
                ', force: ', force
            );
        },

        focus(value) {
            this.$emit('focus', value);
        }
    },

    watch: {
        isMenuActive(value) {
            value ? this.navigatorIcon = '<' : this.navigatorIcon = '>';
        },
    }
};
</script>
  
<style scoped>
    @import "/src/assets/css/modules/navigator.css";
</style>
