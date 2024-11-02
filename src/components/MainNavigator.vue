<template>
    <div class="p1s" id="p1s">
        <div class="menu-hamburguer active" id="menu">
            <div class="user-info">
                <img :src="profilePicture" alt="Foto de perfil" class="profile-picture" />
                <p class="user-name">{{ name }}</p>
                <p class="user-email">{{ email }}</p>
            </div>
    
            <nav class="menu-options">
                <ul>
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
        <!-- <button id="hide_p1s" @click="toggleMenu">></button> -->
        <button id="hide-p1s" @click="toggleMenu">☰</button>
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
        methods: {
            navigateTo(section) {
                // Navega para a seção especificada
                this.$emit("navigate", section);
            },

            handleLogout() {
                // Dispara o evento de logout para o componente pai
                this.$emit("logout");
            },

            toggleMenu() {
                // Função para esconder/mostrar o menu
                const menu = document.getElementById("p1s");
                if (menu.classList.contains('p1s-minimized')) {
                    menu.classList.remove('p1s-minimized');
                    menu.classList.add('p1s-active');
                } else {
                    menu.classList.remove('p1s-active');
                    menu.classList.add('p1s-minimized');
                }
            }
        }
    };
</script>
  
<style scoped>
    @import "/src/assets/css/modules/navigator.css";
</style>
  