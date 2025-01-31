<template>
    <div class="tableSettings">
        <div class="titleBar">
            <div class="tOptions">
                <p>Configurações</p>
                <button class="closeTab" @click="close">×</button>
            </div>
        </div>
        <div class="content">
            <nav class="nav">
                <ul>
                    <li>
                        <a @click="handleNavPage(1, 'Geral')" data-name="Geral">
                            <span class="material-symbols-outlined notranslate">settings</span>
                            <p>Geral</p>
                        </a>
                    </li>
                    <li>
                        <a @click="handleNavPage(2, 'Conta')" data-name="Conta">
                            <span class="material-symbols-outlined notranslate">account_circle</span>
                            <p>Conta</p>
                        </a>
                    </li>
                    <li>
                        <a @click="handleNavPage(3, 'Segurança')" data-name="Segurança">
                            <span class="material-symbols-outlined notranslate">Security</span>
                            <p>Segurança</p>
                        </a>
                    </li>
                </ul>
            </nav>
            <div class="navPage">
                <form @submit.prevent="handleAction">
                    <div 
                        class="pageContainer" 
                        :class="this.actualPage == 1 && 'active'"
                    >
                        <ul>
                            <li>
                                <p>Tema Escuro</p> 
                                <label class="switch">
                                    <input type="checkbox" @change="toggleTheme" v-model="isDarkMode">
                                    <span class="slider"></span>
                                </label>
                            </li>
                        </ul>
                    </div>

                    <div 
                        class="pageContainer" 
                        :class="this.actualPage == 2 && 'active'"
                    >
                        <ul>
                            <li>
                                <p>Foto de Perfil</p>
                                <a>
                                    <img :src="profilePicture" alt="Foto de perfil" class="profile-picture" />
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div 
                        class="pageContainer" 
                        :class="this.actualPage == 3 && 'active'"
                    >
                        <ul>
                            <li>
                                Em breve.
                            </li>
                        </ul>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SettingsTab',
    emits: ['closeWindow'],
    data() {
        return {
            selectedOption: null,
            actualPage: 0,
            isDarkMode: false,
            profilePicture: '/src/assets/images/default/user-data/profile.png',
        }
    },
    mounted() {
        this.actualPage = 1;
        let theme = document.documentElement.getAttribute("data-theme");
        this.isDarkMode = theme == 'dark' ? true : false;
        window.addEventListener('keydown', this.close);
    },
    methods: {
        handleNavPage(value, name) {
            this.actualPage = value;
            this.selectedOption = name ?? null;
        },

        handleAction() {

        },

        toggleTheme() {
            console.log(this.$globalFunc.appTheme(true));
        },

        close() {
            this.$emit('closeWindow');
        }
    }
}
</script>

<style scoped>
    @import url('/src/assets/css/modules/settingsTab.css');
</style>