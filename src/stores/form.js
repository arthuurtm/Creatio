import { defineStore } from 'pinia'

export const useFormStore = defineStore('form', {
  state: () => ({
    formData: {},
    requestedFunction: null,
    currentStep: 1,
    stepState: '',
  }),
  getters: {
    getFormData: (state) => state.formData,
    getRequestedFunction: (state) => state.requestedFunction,
    getCurrentStep: (state) => state.currentStep,
  },
  actions: {
    updateField(field, value) {
      this.formData[field] = value
    },
    setRequestedFunction(value) {
      this.requestedFunction = value
    },
    setCurrentStep(value) {
      this.currentStep = value
    },
  },
})
