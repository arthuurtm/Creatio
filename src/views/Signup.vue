<template>
    <div class="mform">
        <div v-if="isLoading" class="loading-overlay">
            <div class="spinner"></div>
        </div>
        <div class="left">
            <img src="/img/logoMini.png" alt="Logo do Sysroot" id="logo" />
            <h1>Crie sua conta</h1>
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
                                <label for="nickname">Nome de Exibição</label>
                                <input
                                    id="nickname"
                                    class="input"
                                    type="text"
                                    v-model="nickname"
                                    placeholder="Um nome criativo"
                                    autofocus
                                />
                                <label for="username">Nome de Usuário</label>
                                <input
                                    id="username"
                                    class="input"
                                    type="text"
                                    v-model="username"
                                    placeholder="Seu nome de usuário"
                                    required
                                />
                                <div id="error-message" v-if="errorMessage" class="error-message">
                                    ⛔ {{ errorMessage }}
                                </div>
                            </div>
                        </div>
                        </div>
                    </transition>

                    <transition 
                        :name="'goingForward' ? 'slide-right' : 'slide-left'"
                    >
                        <div v-if="currentStep === 2" key="step2">
                        <div class="formStep" data-step="2">
                            <div class="sepElements">
                                <label for="email">E-mail</label>
                                <input
                                    id="email"
                                    class="input"
                                    type="email"
                                    v-model="email"
                                    placeholder="Seu e-mail"
                                    autofocus
                                    required
                                />
                                <label for="birthdate">Data de Nascimento</label>
                                <input
                                    id="birthdate"
                                    class="input date"
                                    type="date"
                                    v-model="birthdate"
                                    placeholder="Sua data de nascimento"
                                    required
                                />
                                <div id="error-message" v-if="errorMessage" class="error-message">
                                    ⛔ {{ errorMessage }}
                                </div>
                            </div>
                        </div>
                        </div>
                    </transition>

                    <transition 
                        :name="'goingForward' ? 'slide-right' : 'slide-left'"
                    >
                        <div v-if="currentStep === 3" key="step3">
                        <div class="formStep" data-step="3">
                            <div class="sepElements">
                                <label for="verifyCode">Código de Verificação</label>
                                <input
                                    id="verifyCode"
                                    class="input"
                                    type="text"
                                    v-model="verifyCode"
                                    placeholder="Código recebido no e-mail"
                                    autofocus
                                    required
                                />
                                <div id="error-message" v-if="errorMessage" class="error-message">
                                    ⛔ {{ errorMessage }}
                                </div>
                            </div>
                        </div>
                        </div>
                    </transition>

                    <transition 
                        :name="'goingForward' ? 'slide-right' : 'slide-left'"
                    >
                        <div v-if="currentStep === 4" key="step4">
                        <div class="formStep" data-step="4">
                            <div class="sepElements">
                                <label for="psswd1">Senha</label>
                                <input
                                    id="psswd1"
                                    class="input"
                                    type="password"
                                    v-model="psswd1"
                                    placeholder="Uma senha BEM segura"
                                    autofocus
                                    required
                                />
                                <label for="psswd2">Confirme a senha</label>
                                <input
                                    id="psswd2"
                                    class="input"
                                    type="password"
                                    v-model="psswd2"
                                    placeholder="Confirme sua senha"
                                    required
                                />
                                <div id="error-message" v-if="errorMessage" class="error-message">
                                    ⛔ {{ errorMessage }}
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
    name: 'Signup',
    data() {
        return {
            currentStep: 1,
            isLoading: false,
            nickname: '',
            username: '',
            email: '',
            birthdate: '',
            verifyCode: '',
            psswd1: '',
            psswd2: '',
            errorMessage: '',
            goingForward: true,
            sentCode: false,
            informationMessage: '',
            buttons: {
                0: [
                    { text: 'Sair', class: 'btn cancel', type: 'submit', action: 'back' },
                    { text: 'Tentar Novamente', class: 'btn confirm', type: 'submit', action: 'forward' }
                ],
                1: [
                    { text: 'Cancelar', class: 'btn destructive', type: 'button', action: 'back' },
                    { text: 'Próximo', class: 'btn confirm', type: 'submit', action: 'forward' }
                ],
                2: [
                    { text: 'Voltar', class: 'btn', type: 'button', action: 'lback' },
                    { text: 'Próximo', class: 'btn confirm', type: 'submit', action: 'forward' }
                ],
                3: [
                    { text: 'Voltar', class: 'btn', type: 'button', action: 'lback' },
                    { text: 'Próximo', class: 'btn confirm', type: 'submit', action: 'forward' }
                ],
                4: [
                    { text: 'Voltar', class: 'btn', type: 'button', action: 'lback' },
                    { text: 'Cadastrar', class: 'btn confirm', type: 'submit', action: 'forward' }
                ]
            }
        }
    },
    watch: {
        nickname(newNickname) {
            this.username = newNickname
                .toLowerCase()
                .replace(/[^a-z0-9_.]/g, '')
                .replace(/\s+/g, '');
        }
    },
    methods: {
        step0() {
            window.location.reload();
        },
        step1() { 
            this.chgStep();
        },
        async step2() {
            this.errorMessage = "";
            if (!this.sentCode) {
                this.isLoading = true;
                try {
                    const res = await fetch(this.$globalFunc.getApiUrl('database', 'signup-generate-code'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: this.email }),
                    });
                    if (res.ok) {
                        this.sentCode = true;
                        this.chgStep();
                    } else {
                        const errorData = await res.json();
                        this.errorMessage = `${errorData.message}`;
                    }
                } catch (error) {
                    console.error("Erro:", error);
                    this.informationMessage = "Erro interno. Tente novamente mais tarde.";
                    this.chgStep(0);
                } finally {
                    this.isLoading = false;
                }
            } else {
                this.chgStep();
            }
        },
        step3() {
            this.chgStep();
        },
        async step4() {
            this.errorMessage = "";
            try {
                if (this.psswd1 !== this.psswd2) {
                    this.errorMessage = "As senhas não coincidem.";
                    return;
                }
                
                this.isLoading = true;
                const response = await fetch(this.$globalFunc.getApiUrl('database', 'signup'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nickname: this.nickname,
                        username: this.username,
                        email: this.email,
                        birthdate: this.birthdate,
                        password: this.psswd1,
                        verificationCode: this.verifyCode,
                    }),
                });

                if (response.ok) {
                    this.informationMessage = "Conta criada com sucesso! Agora, faça login.";
                    this.buttons[0] = [
                        { text: 'Ok', class: 'btn confirm', type: 'submit', action: 'forward' }
                    ];
                    this.chgStep(0);
                } else {
                    const errorData = await response.json();
                    if (errorData.errCode === 'invalidCode') {
                        this.chgStep(3)
                    } else if (errorData.errCode === 'invalidBirthdate') {
                        this.chgStep(2)
                    } else if (errorData.errCode === 'usernameExists') {
                        this.chgStep(1)
                    }
                    this.errorMessage = `${errorData.message}`;
                }
            } catch (error) {
                console.error("Erro:", error);
                this.informationMessage = "Erro interno. Tente novamente mais tarde.";
                this.chgStep(0);
            } finally {
                this.isLoading = false;
            }
        },
        back() {
            this.$router.push('/login');
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
}
</script>

<style scoped>
    @import url('/src/assets/css/modules/mainForm.css');
</style>