<template>
    <main>
        <div class="separador">
            <div class="separador">
                <div class="container">
                    <div class="bubble right">{{ this.msgText }}</div>
                    <div class="bubble left">👽 bilu???</div>
                </div>
                <div class="container text-container">
                    <h1>Algo de errado parece não estar certo... <i>Erro 404</i></h1>
                    <h2>Essa página não existe</h2>
                    <form method="POST" @submit.prevent="back">
                        <button class="btn" type="submit">Voltar</button>
                    </form>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
export default {
    Name: 'NotFound',
    data() {
        return {
            msgText: window.location.pathname,
            maxLength: 20
        }
    },
    mounted() {
        const truncatedText = this.truncateText(this.msgText, this.maxLength);
        document.getElementById("message-text").textContent = truncatedText;
    },
    methods: {
        truncateText(text, maxLength) { 
            if (text.length > maxLength) { 
                return text.substring(0, maxLength - 3) + "..."; 
            } else { 
                return text; 
            }
        },
        back() {
            this.$globalFunc.hrefTo('/');
        },
    }
}
</script>

<style scoped>
    @import url('/src/assets/css/core/bubbles.css');
    @import url('/src/assets/css/modules/errPage.css');
    body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-content: center;
        gap: 20px;
        font-size: 20px;
    }
</style>