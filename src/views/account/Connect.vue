<template>
    <div id="error-message" v-if="errorMessage" class="error-message">
    ✖ {{ errorMessage }}
    </div>
    <div class="mform">
        <div v-if="isLoading" class="loading-overlay">
            <div class="spinner"></div>
        </div>
        <div class="left">
            <img src="/img/logoMini.png" alt="Logo do Sysroot" id="logo" />
            <h1>Conectar uma plataforma externa</h1>
        </div>
        <div class="right">
            <form class="formContainer" @submit.prevent="handleStep">
                <div class="centered">

                    <transition 
                        :name="'goingForward' ? 'slide-right' : 'slide-left'"
                    >
                        <div v-if="currentStep === 1" key="step1">
                        <div class="formStep" data-step="1">
                            <div class="sepElements">
                                <!-- <label>Escolha uma plataforma</label> -->
                                 <div class="button-container" style="display:flex; justify-content: center;">
                                    <div id="googleButton"></div>
                                    <div id="discordButton" @click="redirectToDiscord">
                                        <div class="tooltip-container">
                                            <span class="text">
                                                <div class="borde-back">
                                                <div class="icon">
                                                    <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    class="bi bi-discord"
                                                    viewBox="0 0 16 16"
                                                    >
                                                    <path
                                                        d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"
                                                    ></path>
                                                    </svg>
                                                </div>
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </transition>

                    <transition 
                        :name="'goingForward' ? 'slide-right' : 'slide-left'"
                    >
                        <div v-if="currentStep === 0">
                        <div class="formStep" data-step="0">
                            <div class="sepElements">
                                <p>{{ informationMessage }}</p>
                            </div>
                        </div>
                        </div>
                    </transition>
                </div>
                <div class="sepButtons">
                    <button
                        v-for="(button, index) in buttons[currentStep]"
                        :key="index"
                        :class="button.class"
                        :type="button.type"
                        @click="button.action && handleButtonClick(button.action)"
                    >
                        {{ button.text }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Connect',
    data() {
        return {
            currentStep: 1,
            isLoading: false,
            email: '',
            errorMessage: '',
            goingForward: true,
            informationMessage: '',
            buttons: {
                0: [
                    { text: 'Sair', class: 'btn cancel', type: 'submit', action: 'back' },
                    { text: 'Tentar Novamente', class: 'btn confirm', type: 'submit', action: 'forward' }
                ],
                1: [
                    { text: 'Voltar', class: 'btn', type: 'button', action: 'back' },
                ],
            }
        }
    },
    methods: {
        async handleGoogleLogin(response) {
            try {

                const decodedToken = jwt_decode(response.credential);
                const gToken = decodedToken.sub;
                const res = await fetch(this.$globalFunc.getApiUrl('database', 'getLogin'), {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    type:'google', 
                    gToken: gToken,
                }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Erro desconhecido');
                this.redirect(this.redirectUrl);

            } catch (error) {
                console.error("Erro: ", error.message)
                this.errorMessage = error.message;
            }
        },
        redirectToDiscord() {
            try {
            const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
            const scopes = import.meta.env.VITE_DISCORD_SCOPES;
            const url = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Faccount%2Fconnect%2Fdiscord&scope=${scopes}`;
            window.location.href = url;
            } catch(error) {
                console.error("Erro: ", error.message)
                this.errorMessage = error.message;  
            }
        },
        step0() {
            window.location.reload();
        },
        step1() { 
            this.chgStep();
        },
        back() {
            this.$router.push({name: 'Login'});
        },
        lback() {
            this.errorMessage = "";
            this.currentStep--;
            this.goingForward = false;
        },
        forward() {
            this.errorMessage = "";
            this.goingForward = true;
        },
        handleButtonClick(action) {
            if (this[action]) {
                this[action]();
            }  else {
                console.warn(`Ação "${action}" não encontrada.`);
            }
        },
        handleStep() {
            const stepMethod = `step${this.currentStep}`; // Monta o nome do método dinamicamente
            if (typeof this[stepMethod] === 'function') {
                this[stepMethod](); // Chama o método correspondente
            } else {
                console.warn(`Método ${stepMethod} não existe.`);
            }
        },
        chgStep(value = null) {
            if (value === null) {
                this.goingForward && this.currentStep < 4 ? this.currentStep++ : this.currentStep--;
            } else {
                this.currentStep = value;
            }
            this.$nextTick();
        },
    },
    mounted() {
        google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GCLIENT_LOGIN_ID,
        callback: this.handleGoogleLogin,
        context: "signin",
        ux_mode: "popup",
        auto_prompt: false
        });

        google.accounts.id.renderButton(
        document.getElementById("googleButton"),
        {
            size: "large",
            type: "icon",
            shape: "pill",
            text: "continue_with",
            logo_alignment: "left",
        }
        );
    }
}
</script>

<style scoped>
    @import url('/src/assets/css/modules/mainForm.css');
</style>