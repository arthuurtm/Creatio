<template>
    <div class="h1s" id="h1s">
        <div class="menu active" id="menu">
            <nav class="menu-options">
                <ul>
                    <li>
                        <a class="menu-link" @click="navigateTo('jogos')" data-section="jogos">
                            <span class="material-symbols-outlined">sports_esports</span>
                            <p>Jogos</p>
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
        methods: {
            navigateTo(section) {
                // Navega para a seção especificada
                this.$emit("navigate", section);
            },

            handleLogout() {
                this.$emit.openModal({
                    message: 'Você deseja sair da sua conta?',
                    title: 'Sair',
                    action: 'logout'
                });
            },
        }
    };
</script>
  
<style scoped>
    @import "/src/assets/css/modules/header.css";
</style>
  