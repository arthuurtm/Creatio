<template>
    <div class="create-page-container">
        <h1 class="create-page-header">Criação de Sessão de RPG</h1>
        <div class="section">
            <h2>Projetos Recentes</h2>
            <ul class="project-list">
                <li>Missão na Floresta Sombria</li>
                <li>Aventura nas Ruínas Perdidas</li>
            </ul>
        </div>
        <div class="section">
            <h2>Projetos Colaborativos</h2>
            <ul class="project-list">
                <li>Campanha dos Cavaleiros de Prata</li>
                <li>Expedição ao Abismo</li>
            </ul>
        </div>
        <button class="btn">Criar Nova Sessão</button>
    </div>
</template>

<script>
export default {
    name: 'Create',
}
</script>

<style scoped>
    @import url('/src/assets/css/modules/createPage.css');
</style>