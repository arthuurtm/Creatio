<template>
    <div class="grid-container">
        <div 
            class="focus-element"
            :class="isFocusElement && 'active'"
        ></div>

        <Navigator 
            @navigateTo="handleNavigate"
            @focus="handleFocusElement"
        />

        <div class="view-app">
            <router-view/>
        </div>

    </div>
</template>

<script>
import Navigator from '@/components/Navigator.vue';

export default {
    data() {
        return {
            focusElement: false,
            isFocusElement: false,
        };
    },

    watch: {
        focusElement(value) {
            value ? this.isFocusElement = true : this.isFocusElement = false;
        },
    },

    components: {
        Navigator,
    },
    
    methods: {
        handleFocusElement(value) {
            value ? this.focusElement = true : this.focusElement = false;
        },
    },
};
</script>


<style scoped>
    @import url('/src/assets/css/modules/mainLayout.css');
</style>