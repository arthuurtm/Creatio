<template>
  <div class="page">
    <span class="settings-button material-symbols-outlined notranslate" @click="handleSettingsBox">settings</span>

    <transition name="errAnim">
      <div v-if="errorMessage" id="error-message" class="error-message" :class="errorMessage && 'show'">
        ✖ {{ errorMessage }}
      </div>
    </transition>

    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <div class="main-form-container">

      <div class="left">
        <img src="@/assets/img/min-logo.png" alt="Logo do Sysroot" id="logo" />
        <h1 v-if="config">{{ config.title }}</h1>
        <h1 v-else>Erro Interno</h1>
      </div>

      <div v-if="hasStepsData && currentStepData" class="right">


        <form v-if="hasStepsData" class="form-container" @submit.prevent="submitForm">


          <div class="centered">
            <transition name="slide-left" mode="out-in">
              <div :key="currentStepData.stepIndex">
                <div class="sepElements">

                  <CreateTextField v-for="field in currentStepData.fields" :key="field.model" :field="field"
                    v-model="formData[field.model]" :error-message="errors[field.model]"
                    @emitEvent="handleFunctionEvent" />

                </div>
              </div>
            </transition>
          </div>

          <CreateAnchor v-if="currentStepData.anchor" :anchor="currentStepData.anchor"
            @emitEvent="handleFunctionEvent" />

          <CreateButton v-if="currentStepData.buttons" :buttons="currentStepData.buttons"
            @emitEvent="handleFunctionEvent" />
        </form>
      </div>


      <div v-else class="right">
        <form class="form-container" @submit.prevent="submitForm">

          <div class="centered">
            <div class="sepElements">
              <p>Ocorreu um erro interno, tente novamente mais tarde.</p>
            </div>
          </div>

          <div class="sepButtons">
            <button class="btn" @click="handleFunctionEvent({ action: 'back', type: 'local' })">Voltar</button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>


<script>
import { computed, ref } from "vue";
import { useFormStore } from "@/stores/formStore";
import CreateTextField from "@/components/elements/CreateTextField.vue";
import CreateAnchor from "@/components/elements/CreateAnchor.vue";
import CreateButton from "@/components/elements/CreateButton.vue";
import { useAppDynamicDialog } from '@/stores/store'

export default {
  components: { CreateTextField, CreateAnchor, CreateButton },

  emits: ["button-click"],

  props: {
    config: Object,
    errorMessage: String,
    isLoading: Boolean,
  },

  setup(props) {
    let errors = ref({});
    let formData = computed(() => useFormStore().formData);


    let currentStep = computed(() => useFormStore().getCurrentStep());
    console.log("Current Step:", currentStep.value);

    const allSteps = computed(() => {
      if (!props.config?.steps) return [];
      return Object.entries(props.config.steps).map(([key, value]) => ({
        ...value,
        stepIndex: Number(key), // Guarda a chave numérica como índice
      }));
    });

    const currentStepData = computed(() => {
      return allSteps.value.find(step => step.stepIndex === currentStep.value) || null;
    });

    console.log('allSteps: ', allSteps);

    const hasStepsData = computed(() => !!props.config?.steps);
    console.log('hasStepsData: ', hasStepsData);
    // const hasCurrentStepData = computed(() => !!currentStepData.value);

    function submitForm() {

    };

    function handleSettingsBox() {
      useAppDynamicDialog().setDialog('DialogSettings', { title: 'Configurações' });
    }

    return { formData, errors, submitForm, currentStep, currentStepData, hasStepsData, handleSettingsBox };
  },

  methods: {
    handleButtonClick(action) {
      useFormStore().setRequestedFunction(action);
      console.log('handleButtonClick() > action: ', useFormStore().getRequestedFunction());
    },

    handleFunctionEvent(payload) {
      const { action, value, type } = payload;
      if (type === 'local') {
        if (this[action]) {
          this[action](value);
        } else {
          console.warn(`Ação "${action}" não encontrada.`);
        }
      } else {
        console.log('Executando função no componente pai.');
        this.handleButtonClick(action);
      }
    },

    // Funções locais reutilizáveis

    redirect(link) {
      this.$router.push({ name: link });
    },

    forward() {
      useFormStore().setCurrentStep(useFormStore().getCurrentStep() + 1);
    },

    rewind() {
      useFormStore().setCurrentStep(useFormStore().getCurrentStep() - 1);
    },

    back() {
      this.$router.back();
    },
  },
};
</script>


<style scoped>
@import url(/src/assets/css/components/c-form.css);
</style>
