<template>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none" class="animated-bg">
        <path d="M0,50 Q50,0 100,50 T200,50" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
        <circle cx="50" cy="50" r="20" fill="rgba(0, 150, 255, 0.5)" />
    </svg>
</template>

<script>
    export default {
        name: "AnimatedBackground",
    };
</script>

<style scoped>
    .animated-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        animation: wave 5s infinite ease-in-out;
    }

    @keyframes wave {
        0% {
            d: path("M0,50 Q50,0 100,50 T200,50");
        }
        50% {
            d: path("M0,50 Q50,100 100,50 T200,50");
        }
        100% {
            d: path("M0,50 Q50,0 100,50 T200,50");
        }
    }
</style>
  