import { defineStore } from 'pinia'

export const useFormStore = defineStore('form', {
  state: () => ({
    formData: {},
    requestedFunction: null,
    currentStep: 1,
    stepState: '',
  }),
  getters: {
    getFormData: (state) => {
      return state.formData
    },
    getRequestedFunction: (state) => {
      return state.requestedFunction
    },
    getCurrentStep: (state) => {
      return state.currentStep
    },
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
