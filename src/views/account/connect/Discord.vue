<template>
    <div v-if="this.isLoading" class="loading-overlay">
        <div class="spinner"></div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { getApiUrl } from "@/utils/functions";

export default {
    setup() {
        const route = useRoute();
        const router = useRouter();
        const isLoading = ref(true);

        onMounted(() => {
            const code = route.query.code;
            if (code) {
                exchangeCodeForToken(code);
            }
        });

        async function exchangeCodeForToken(code) {
            try {
                const response = await fetch(getApiUrl('database', 'setDiscord'), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                });

                const data = await response.json();
                console.log("Token recebido:", data);
            } catch (error) {
                console.error("Erro ao trocar código por token:", error);
            } finally {
                back();
            }
        }

        function back() {
            isLoading.value = false;
            router.push({ name: "Login" });
        }

        return {
            isLoading,
            back,
        };
    },
};
</script>
