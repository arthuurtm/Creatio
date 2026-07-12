<p align="center">
  <img src="apps/web/src/assets/logo.svg" alt="Creatio Logo" width="180" />
</p>

## Creatio — desenvolva lógicas e scripts visuais sem complicações

Creatio é uma IDE e editor de programação visual projetado para construir, depurar e transpilar lógicas e scripts direto de uma interface web interativa. O objetivo é democratizar o desenvolvimento de algoritmos e automações através de fluxos visuais que geram código real.

### Como funciona o sistema

O ecossistema do Creatio opera de forma modular através de uma arquitetura em monorepo dividida em três pilares principais:

1. **Espaço de Trabalho Visual (Frontend - Vue 3 & Vue Flow)**:
   * O usuário modela algoritmos visualmente arrastando e conectando nós (representando declarações de variáveis, estruturas condicionais, loops de repetição e invocações de funções).
   * O canvas interativo é construído sobre o `@vue-flow/core` e Vuetify, permitindo manipular grandes fluxogramas de lógica com alta performance.
   * O estado do editor é gerenciado via Pinia e sincronizado em tempo real com o servidor.

2. **Serviço de Sincronização & Persistência (Backend - Express & WebSockets)**:
   * Suporta sessões colaborativas de edição multiusuário em tempo real utilizando WebSockets (`ws`).
   * Gerencia autenticação, controle de propriedade de projetos e banco de dados relacional (MySQL/MariaDB via Sequelize).
   * Persiste e carrega estados de projetos complexos utilizando armazenamento de objetos (como MinIO/S3).

3. **Motor de Compilação AST (`@projeto/compiler`)**:
   * O compilador lê a árvore de conexões visuais e a ordena logicamente a partir dos pontos de entrada de execução.
   * O `ASTTranspiler` coordena sub-compiladores específicos (`VariablesTranspiler`, `FunctionsTranspiler` e `LogicsTranspiler`) para processar cada categoria de nós.
   * Transforma a representação visual em uma árvore de sintaxe abstrata padrão do ecossistema JavaScript (ESTree AST).
   * A biblioteca `astring` consome a AST resultante e gera código JavaScript real, limpo e devidamente formatado.

### Recursos

Este sistema fornece alguns recursos principais:
- **Editor de Lógica Centralizado**: Crie e conecte fluxos, funções, condições, loops e variáveis de maneira visual e intuitiva.
- **Compilador Integrado (ASTTranspiler)**: Transpile instantaneamente seus nós visuais para código JavaScript estruturado (padrão ESTree).
- **Gerenciamento de Projetos**: Crie, gerencie e salve seus scripts com suporte nativo a sessões colaborativas via WebSockets.

### Tecnologias usadas

![](https://img.shields.io/badge/Vue.js-3-34495E?logo=vue.js&logoColor=4FC08D&style=flat-square "Vue.js 3") ![](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white&style=flat-square "Node.js") ![](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white&style=flat-square "TypeScript") ![](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white&style=flat-square "pnpm") ![](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black&style=flat-square "Javascript") ![](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white&style=flat-square "HTML 5") ![](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white&style=flat-square "MySQL")
