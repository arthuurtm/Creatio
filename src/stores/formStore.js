import { defineStore } from 'pinia'

export const useFormStore = defineStore('form', {
  state: () => ({
    formData: {},
    requestedFunction: null,
    currentStep: 1,
  }),
  actions: {
    updateField(field, value) {
      this.formData[field] = value
    },
    getRequestedFunction() {
      const requestedFunction = this.requestedFunction
      return requestedFunction
    },
    setRequestedFunction(value) {
      this.requestedFunction = value
    },
    clearRequestedFunction() {
      this.requestedFunction = null
    },
    getCurrentStep() {
      return this.currentStep
    },
    setCurrentStep(value) {
      this.currentStep = value
    },
    resetCriticalValues() {
      this.currentStep = 1
      this.requestedFunction = null
    },
  },
})
