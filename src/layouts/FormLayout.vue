<template>
    <div id="error-message" v-if="errorMessage" class="error-message">
    ✖ {{ errorMessage }}
    </div>

    <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
    </div>

    <div class="mform">
        <div class="left">
            <img src="/img/logoMini.png" alt="Logo do Sysroot" id="logo" />
            <h1 v-if="title"> {{ title }} </h1>
            <h1 v-else> name </h1>
        </div>
        
        <div class="right">
            <form class="formContainer" @submit.prevent="handleStep">
                <div class="centered">
                    <transition name="slide-left">
                        <slot></slot>
                    </transition>
                </div>
            </form>
        </div>
    </div>
</template>
  
<script>
export default {
    props: {
        title: String,
        name: String,
    },
};
</script>