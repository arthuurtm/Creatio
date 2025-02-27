<template>
    <div 
        class="grid-container"
        :class="isFocusElement && 'focus-element'"
    >
    
        <Navigator 
            @navigateTo="handleNavigate"
            @focus="handleFocusElement"
            :hidden="computedHiddenNavigator"
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

    props: {
        hiddenNavigator: Boolean,
    },

    components: {
        Navigator,
    },

    watch: {
        focusElement(value) {
            value ? this.isFocusElement = true : this.isFocusElement = false;
        },
    },

    computed: {
        computedHiddenNavigator() {
            return this.$route.meta.hiddenNavigator ?? this.hiddenNavigator;
        }
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