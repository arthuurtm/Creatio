<template>
    <div v-if="errorMessage" class="error-message">
    ✖ {{ errorMessage }}
    </div>

    <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
    </div>

    <div class="mform">

        <div class="left">
            <img src="/img/logoMini.png" alt="Logo" id="logo" />
            <h1>{{ formConfig.title }}</h1>
        </div>

        <div class="right">
            <form class="formContainer" @submit.prevent="handleStep">
                <div class="centered">
                    <router-view 
                        v-slot=" { Component }"
                        :currentStep="currentStep"
                    >
                        <transition :name="goingForward ? 'slide-right' : 'slide-left'">
                            <component 
                                :is="Component"
                                @updateFormConfig="handleUpdateFormConfig"
                            ></component>
                        </transition>
                    </router-view>
                </div>
    
                <div class="sepButtons">
                    <button v-for="(button, index) in formConfig.buttons[this.currentStep]" 
                            :key="index"
                            :class="button.class"
                            :type="button.type"
                            @click="handleButtonClick(button.action)">
                        {{ button.text }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {

    emits:[
        'updateFormConfig',
    ],

    mounted() {console.log('Layout FormLayout Carregado!')},

    data() {
        return {
            currentStep: 1,
            isLoading: false,
            errorMessage: '',
            goingForward: true,
            formConfig: {
                title: '',
                buttons: {},
            }
        }
    },
    
    methods: {
        handleUpdateFormConfig(newFormConfig) {
            this.formConfig = newFormConfig;
            console.log('FormConfig atualizado no pai:', newFormConfig);
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
            } else {
                console.warn(`Ação "${action}" não encontrada no componente pai.`);
            }
        },

        handleStep() {
            // Monta o nome do método dinamicamente com base no currentStep
            const actionMethod = `step${this.currentStep}`;

            // Acessa o componente filho via $refs
            const childComponent = this.$refs.childComponent;

            // Verifica se o método existe no componente filho
            if (childComponent && typeof childComponent[actionMethod] === 'function') {
                childComponent[actionMethod](); // Chama o método correspondente no filho
            } else {
                console.warn(`Método ${actionMethod} não existe no componente filho.`);
            }
        },

        handleChildrenData(data) {
            this.formData = data;
            console.log('Dados recebidos do filho:', this.formData);
        },

        chgStep(value = null) {
            if (value === null) {
                this.goingForward && this.currentStep < 4 ? this.currentStep++ : this.currentStep--;
            } else {
                this.currentStep = value;
            }
            this.$nextTick();
        },
    }
}
</script>

<style>
    @import url('/src/assets/css/modules/mainForm.css');
</style>