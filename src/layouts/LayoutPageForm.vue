<template>
  <div class="app-form">
    <div class="header-actions">
      <slot name="header-actions" />
    </div>

    <div class="main-container">
      <div class="left">
        <div id="logo">
          <CLogo />
        </div>
        <h1>
          <slot name="title">{{ title }}</slot>
        </h1>
        <h4>
          <slot name="subTitle">{{ subTitle }}</slot>
        </h4>
        <slot name="formInfo" />
      </div>

      <div class="right">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Formulário' },
  subTitle: { type: String },
})
</script>

<style>
.app-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-self: center;
  height: 100%;
  width: 100%;
  background: var(--bg);
  box-sizing: border-box;
}

.header-actions {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
}

.main-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 30px;
  padding: 35px;
  gap: 5px;
  width: 840px;
  height: auto;
  background: var(--bg2);
  transition: border 300ms ease-out;
  overflow: hidden;
  min-height: 300px;
  animation: fadeInBlur 0.2s ease-out;
  scrollbar-color: var(--bg) var(--bg);
  scrollbar-width: thin;
  box-shadow: 0 3px 6px var(--primary-shadow);
}

.main-container .left {
  grid-column: 1;
}

.main-container .right {
  display: grid;
  position: relative;
  grid-column: 2;
  grid-auto-flow: column;
  overflow-x: clip;
  min-width: 0;
  max-height: 800px;
  overflow-y: auto;
}

.main-container #logo {
  width: fit-content;
  height: 6rem;
}

.main-container p {
  font-size: 15px;
  margin-bottom: 25px;
  text-align: justify;
}

.main-container h1 {
  margin: 0 0 1rem 0;
  font-weight: bold;
}

.main-container h4 {
  margin: 0;
  font-weight: normal;
}

@media (max-width: 900px) {
  .app-form {
    flex-direction: column;
  }

  .main-container {
    min-width: 80%;
    border: none;
    width: unset;
    height: none;
  }
}

@media (max-width: 600px) {
  .app-form {
    background: var(--bg2);
  }

  .main-container {
    grid-template-rows: auto auto;
    grid-template-columns: none;
    border-radius: unset;
    padding: 0;
    gap: 0;
    width: 90%;
    height: auto;
    box-shadow: none;
  }

  .main-container .left {
    display: grid;
    grid-row: 1;
    grid-column: 1;
  }

  .main-container .right {
    grid-row: 2;
    grid-column: 1;
  }

  .main-container .left h1 {
    text-align: center;
  }

  .form-container {
    gap: 30px;
  }

  #logo {
    justify-self: center;
  }
}
</style>
