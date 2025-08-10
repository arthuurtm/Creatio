<template>
  <div class="page">
    <CreateButton
      :buttons="[
        {
          icon: 'settings',
          class: 'symbolic no-padding no-scalling',
          action: () => handleSettingsBox(),
          style: `
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          `,
        },
      ]"
    />

    <div class="main-form-container">
      <div class="left">
        <div id="logo">
          <CreateLogo />
        </div>
        <h1>{{ title }}</h1>
        <h4>{{ subTitle }}</h4>
        <slot name="formInfo" />
      </div>

      <div class="right">
        <form class="form-container centered" @submit.prevent="submitForm">
          <transition name="slide-left" mode="out-in">
            <div class="sepElements" :key="currentStep">
              <slot name="fields" />
            </div>
          </transition>

          <slot name="anchors" />
          <div class="sepButtons">
            <slot name="buttons" />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppDynamicDialog } from '@/stores'
import DialogSettings from '@/components/dialogs/DialogSettings.vue'

const dialog = useAppDynamicDialog()

defineProps({
  title: {
    type: String,
    default: 'Formulário',
  },
  subTitle: {
    type: String,
    default: '',
  },
  currentStep: {
    type: Number,
    default: 1,
  },
})

function handleSettingsBox() {
  dialog.setDialog(DialogSettings, { title: 'Configurações' })
}
</script>

<style scoped>
@-moz-document url-prefix() {
  .main-form-container .right {
    overflow-x: hidden !important;
    overflow: hidden;
  }
  .centered {
    align-items: unset !important;
  }
}

.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-self: center;
  height: 100%;
  width: 100%;
  background: var(--bg2);
  box-sizing: border-box;
}

.page.minimal {
  background: transparent;
  display: unset;
  width: 100%;
}

.page.minimal .main-form-container {
  display: flex;
  flex-direction: column;
  height: auto;
  width: 100%;
  min-width: unset;
  max-width: 400px;
  margin: 0 auto;
  border-radius: 1rem;
  padding: 1.5rem;
  border: none;
  box-shadow: none;
  background: var(--bg2);
  padding: 0;
}

.page.minimal .main-form-container .left {
  display: none !important;
}

.page.minimal .main-form-container .right {
  flex: 1 1 auto;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.main-form-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 30px;
  padding: 35px;
  gap: 5px;
  width: 830px;
  height: auto;
  border: 1px solid var(--border);
  background: var(--bg);
  transition: border 300ms ease-out;
  overflow: hidden;
  min-height: 350px;
  animation: fadeInBlur 0.2s ease-out;
  scrollbar-color: var(--bg) var(--bg);
  scrollbar-width: thin;
  box-shadow: 0 3px 6px var(--primary-shadow);
  backdrop-filter: var(--main-saturate);
  -webkit-backdrop-filter: var(--main-saturate);
  box-shadow: 0 8px 32px 0 var(--main-shadow);
}

.main-form-container .left {
  grid-column: 1;
}

.main-form-container .right {
  display: grid;
  position: relative;
  grid-column: 2;
  grid-auto-flow: column;
  overflow-x: clip;
  min-width: 0;
  max-height: 800px;
  overflow-y: auto;
}

#logo {
  width: fit-content;
  height: 6rem;
}

.main-form-container p {
  font-size: 15px;
  margin-bottom: 25px;
  text-align: justify;
}

.main-form-container label {
  font-size: 14px;
  font-weight: 600;
}

.main-form-container h1 {
  margin: 0 0 1rem 0;
}

.main-form-container a {
  display: inline-block;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--text);
  transition: all linear 160ms;
  text-decoration: none;
  cursor: pointer;
}

.form-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
}

.sepElements {
  display: flex;
  flex-direction: column;
  gap: 30px;
  justify-content: center;
  height: 100%;
  width: 100%;
  word-break: break-word;
  overflow-wrap: break-word;
}

.groupElements {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: inherit;
}

.groupElements label,
.groupElements a {
  margin-left: 3px;
}

.show {
  display: block;
}

.centered {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.centered > div {
  width: 100%;
  box-sizing: border-box;
}

.settings-button {
  display: flex;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  transition: transform 0.5s ease-in-out;
  color: var(--form-sub);
}

.settings-button:hover {
  transform: rotate(180deg);
}

@media (max-width: 900px) {
  .page {
    flex-direction: column;
  }

  .main-form-container {
    min-width: 80%;
    border: none;
    width: unset;
    height: none;
  }
}

@media (max-width: 600px) {
  .page {
    background: var(--form);
  }

  .main-form-container {
    grid-template-rows: auto auto;
    grid-template-columns: none;
    border-radius: unset;
    padding: 0;
    gap: 0;
    width: 90%;
    height: auto;
    box-shadow: none;
  }

  .main-form-container .left {
    display: grid;
    grid-row: 1;
    grid-column: 1;
  }

  .main-form-container .right {
    grid-row: 2;
    grid-column: 1;
  }

  .main-form-container .left h1 {
    text-align: center;
  }

  .form-container {
    gap: 30px;
  }

  .sepButtons {
    position: unset;
  }

  #logo {
    justify-self: center;
  }
}
</style>
