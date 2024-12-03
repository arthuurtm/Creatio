<template>
    <button id="hide-p1s" @click="toggleMenu">☰</button>
    <div 
        class="p1s" 
        :class="[isMenuActive ? 'active' : 'minimized', isPcScreen ? 'pc' : '']" 
        id="p1s" 
        ref="menu"
    >
        <div class="invisible-drag-camp" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
            <div class="drag-handle" @click="onClickHandle"></div>
        </div>
        <div class="user-info">
            <img :src="profilePicture" alt="Foto de perfil" class="profile-picture" />
            <div class="mobile-adaptive-usrInfo">
                <p class="user-name">{{ name }}</p>
                <p class="user-email">{{ email }}</p>
            </div>
        </div>
        <div class="center">
            <nav class="menu-options">
                <ul>
                    <!-- <li v-for="(item, index) in menuItems" :key="index">
                        <a 
                            v-if="!item.isConfirm"
                            class="menu-link"
                            @click="navigateTo(item.route)"
                        >
                            <span class="material-symbols-outlined">{{ item.icon }}</span>
                            <p>{{ item.label }}</p>
                        </a>

                        <a 
                            v-else
                            class="menu-link"
                            @click="item.func"
                            :data-title="item.label"
                            :data-message="item.message"
                            :data-action="item.route"
                        >
                            <span class="material-symbols-outlined">{{ item.icon }}</span>
                            <p>{{ item.label }}</p>
                        </a>
                    </li> -->
                    <li>
                        <a class="menu-link" @click="navigateTo('jogos')" data-section="jogos">
                            <span class="material-symbols-outlined">sports_esports</span>
                            <p>Jogos</p>
                        </a>
                    </li>
                    <li>
                        <a class="menu-link" @click="navigateTo('personagens')" data-section="personagens">
                            <span class="material-symbols-outlined">person</span>
                            <p>Personagens</p>
                        </a>
                    </li>
                    <li>
                        <a class="menu-link" @click="navigateTo('configuracoes')" data-section="configuracoes">
                            <span class="material-symbols-outlined">settings</span>
                            <p>Configurações</p>
                        </a>
                    </li>
                    <li>
                        <a 
                            id="logoutMenuButton" 
                            @click="handleLogout"
                            data-title="Sair" 
                            data-message="Você deseja sair da sua conta?" 
                            data-action="logout"
                        >
                            <span class="material-symbols-outlined">logout</span>
                            <p>Sair</p>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
</template>
  
<script>
export default {
    name: 'Navigator',
    props: {
        profilePicture: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            startY: 0,
            currentY: 0,
            isDragging: false,
            isMenuActive: false,
            isPcScreen: window.innerWidth > 900, // Estado inicial baseado na largura da tela
            halfScreenY: window.innerHeight / 2, // Meta da tela em Y
            profilePicture: '/src/assets/img/default/user-data/profile.png',
            name: 'Joãozinho gatinho',
            email: 'homemmaislindo@gmail.com',
            // menuItems: [
            //     { 
            //         label: "Jogos", 
            //         icon: "sports_esports", 
            //         route: "jogos", 
            //         isConfirm: false 
            //     },
            //     { 
            //         label: "Criar", 
            //         icon: "add_circle", 
            //         route: "criar", 
            //         isConfirm: false 
            //     },
            //     { 
            //         label: "Personagens", 
            //         icon: "person", 
            //         route: "personagens", 
            //         isConfirm: false 
            //     },
            //     { 
            //         label: "Configurações", 
            //         icon: "settings", 
            //         route: "configuracoes", 
            //         isConfirm: false 
            //     },
            //     { 
            //         label: "Sair", 
            //         icon: "logout", 
            //         route: "logout", 
            //         isConfirm: false, 
            //         message: "Você deseja sair da sua conta?", 
            //         func: "handleLogout()",
            //     }
            // ]
        };
    },
    methods: {
        handleAction(item) {
            if (item.func && typeof this[item.func] === "function") {
                this[item.func]();  // Chama a função associada dinamicamente
            }
        },
        navigateTo(section) {
            this.$emit("navigate", section);
        },
        handleLogout() {
            this.$emit('openOverlayModal', {
                message: 'Você deseja sair da sua conta?',
                title: 'Sair',
                action: 'logout'
            });
        },
        toggleMenu() {
            //Função para esconder/mostrar o menu
            const menu = document.getElementById("p1s");
            if (menu.classList.contains('minimized')) {
                menu.classList.remove('minimized');
                menu.classList.add('active');
            } else {
                menu.classList.remove('active');
                menu.classList.add('minimized');
            }
        },
        onTouchStart(event) {
            this.startY = event.touches[0].clientY;
            this.isDragging = true;
        },
        onTouchMove(event) {
            if (!this.isDragging) return;

            this.currentY = event.touches[0].clientY;
            const translateY = this.currentY - this.startY;
            this.$refs.menu.style.transform = `translateY(${translateY}px)`;
        },
        onTouchEnd() {
            if (!this.isDragging) return;
            this.isDragging = false;

            const deltaY = this.currentY - this.startY;

            // Defina um valor mínimo de arrasto para ativar a mudança (e.g., 50px)
            const activationThreshold = 50;

            if (deltaY < -activationThreshold) {
                // Arrastou para cima o suficiente
                this.$refs.menu.style.transform = 'translateY(10%)';
                this.isMenuActive = true;
            } else if (deltaY > activationThreshold) {
                // Arrastou para baixo o suficiente
                this.$refs.menu.style.transform = 'translateY(100%)';
                this.isMenuActive = false;
            } else {
                // Caso o movimento seja pequeno, mantém o estado atual
                if (this.isMenuActive) {
                    this.$refs.menu.style.transform = 'translateY(10%)';
                } else {
                    this.$refs.menu.style.transform = 'translateY(100%)';
                }
            }
        },
        onClickHandle() {
            const menu = document.getElementById("p1s");
            console.log(`OnClickHandle() > Clique no botão do menu detectado. ${menu.classList.contains('minimized')}`)
            if (menu.classList.contains('minimized')) {
                console.log('Entrou no if');
                this.isMenuActive = false;
                this.$refs.menu.style.transform = 'translateY(100%)';
            } else {
                console.log('Entrou no else');
                this.isMenuActive = true;
                this.$refs.menu.style.transform = 'translateY(10%)';
            }
        },
        handleResize() {
            this.isPcScreen = window.innerWidth > 900;
        },
    },
    mounted() {
        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
    },
};
</script>
  
<style scoped>
    @import "/src/assets/css/modules/navigator.css";
</style>
