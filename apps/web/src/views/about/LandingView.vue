<template>
  <div class="landing-view">
    <!-- ============ NAVBAR ============ -->
    <v-container class="px-4 px-md-8 py-4">
      <v-row align="center" justify="space-between" no-gutters>
        <v-col cols="auto" class="d-flex align-center ga-2">
          <div class="icon-squircle">
            <v-icon color="primary" size="20">hub</v-icon>
          </div>
          <span class="text-h6 font-weight-bold">Creatio</span>
        </v-col>

        <v-col cols="auto" class="d-flex align-center ga-2">
          <v-btn variant="text" class="text-none d-none d-sm-flex" href="#como-funciona">Como funciona</v-btn>
          <v-btn variant="text" class="text-none d-none d-sm-flex" href="#open-source">Código aberto</v-btn>
          <v-btn variant="outlined" class="text-none" prepend-icon="code" href="https://github.com" target="_blank">
            GitHub
          </v-btn>
          <v-btn color="primary" class="text-none" to="/register">Começar grátis</v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- ============ HERO ============ -->
    <v-container class="px-4 px-md-8 py-8 py-md-12">
      <v-row align="center">
        <v-col cols="12" md="6">
          <v-chip size="small" variant="tonal" color="tertiary" class="font-weight-medium mb-4">
            <span class="dot mr-2"></span>
            Open source &middot; em construção com a comunidade
          </v-chip>

          <h1 class="display-text text-h3 text-md-h2 mb-4">
            <span class="d-block">Programe vendo a lógica,</span>
            <span class="d-block text-gradient-brand">não decorando sintaxe</span>
          </h1>

          <p class="text-body-1 text-md-h6 text-medium-emphasis font-weight-regular max-width-560 mb-6">
            Creatio é um editor visual por nodes para aprender JavaScript de verdade.
            Monte a lógica conectando blocos, veja o fluxo dos dados e entenda exatamente
            o que está rodando — sem instalar nada, sem perder o que você fez.
          </p>

          <div class="d-flex flex-wrap ga-3 mb-8">
            <v-btn color="primary" size="x-large" class="text-none" append-icon="arrow_forward" to="/register">
              Começar a programar
            </v-btn>
            <v-btn variant="outlined" size="x-large" class="text-none" prepend-icon="code" href="https://github.com" target="_blank">
              Ver código no GitHub
            </v-btn>
          </div>

          <div class="d-flex flex-wrap ga-6">
            <div class="d-flex align-center ga-2">
              <v-icon color="success" size="20">cloud_done</v-icon>
              <span class="text-body-2 text-medium-emphasis">Nuvem grátis, sem plano pago</span>
            </div>
            <div class="d-flex align-center ga-2">
              <v-icon color="success" size="20">visibility</v-icon>
              <span class="text-body-2 text-medium-emphasis">Código 100% aberto</span>
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="6" class="mt-10 mt-md-0">
          <div class="node-graph-shell pa-4 pa-md-6">
            <svg viewBox="0 0 480 360" class="node-graph" role="img" aria-label="Diagrama mostrando blocos de lógica conectados, representando o editor por nodes">
              <path class="flow-line" d="M 70 70 C 140 70, 140 70, 190 100" />
              <path class="flow-line" d="M 190 100 C 250 130, 250 130, 300 110" />
              <path class="flow-line" d="M 190 100 C 230 170, 230 170, 270 220" />
              <path class="flow-line" d="M 270 220 C 320 250, 320 250, 380 250" />
              <path class="flow-line" d="M 300 110 C 350 120, 350 120, 400 150" />

              <!-- node: on click -->
              <g transform="translate(20,45)">
                <rect class="node-box node-primary" width="110" height="48" rx="16" />
                <text x="55" y="29" text-anchor="middle" class="node-label">on click</text>
              </g>

              <!-- node: if -->
              <g transform="translate(150,76)">
                <rect class="node-box node-secondary" width="90" height="48" rx="16" />
                <text x="45" y="29" text-anchor="middle" class="node-label">if (x &gt; 0)</text>
              </g>

              <!-- node: fetch -->
              <g transform="translate(280,86)">
                <rect class="node-box node-tertiary" width="110" height="48" rx="16" />
                <text x="55" y="29" text-anchor="middle" class="node-label">fetch(api)</text>
              </g>

              <!-- node: transform -->
              <g transform="translate(220,196)">
                <rect class="node-box node-secondary" width="100" height="48" rx="16" />
                <text x="50" y="29" text-anchor="middle" class="node-label">map(item)</text>
              </g>

              <!-- node: return -->
              <g transform="translate(360,226)">
                <rect class="node-box node-primary" width="100" height="48" rx="16" />
                <text x="50" y="29" text-anchor="middle" class="node-label">return</text>
              </g>
            </svg>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- ============ FEATURES ============ -->
    <v-container class="px-4 px-md-8 py-10 py-md-14">
      <div class="mb-8" style="max-width: 560px;">
        <h2 class="display-text text-h4 mb-3">Feito para quem está aprendendo</h2>
        <p class="text-body-1 text-medium-emphasis">
          Cada decisão do editor existe para tirar a sintaxe do caminho e deixar
          a lógica visível.
        </p>
      </div>

      <v-row>
        <v-col cols="12" sm="6" lg="3" v-for="feature in features" :key="feature.title">
          <v-card variant="flat" class="feature-card pa-5" height="100%">
            <div class="icon-squircle mb-4" :class="`icon-squircle--${feature.color}`">
              <v-icon :color="feature.color" size="22">{{ feature.icon }}</v-icon>
            </div>
            <h3 class="text-h6 font-weight-bold mb-2">{{ feature.title }}</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ feature.text }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- ============ COMO FUNCIONA ============ -->
    <v-container id="como-funciona" class="px-4 px-md-8 py-10 py-md-14">
      <div class="mb-8" style="max-width: 560px;">
        <h2 class="display-text text-h4 mb-3">Da ideia ao código rodando</h2>
        <p class="text-body-1 text-medium-emphasis">
          Quatro passos, sem configuração e sem instalar nada.
        </p>
      </div>

      <v-row>
        <v-col cols="12" sm="6" md="3" v-for="(step, i) in steps" :key="step.title">
          <div class="d-flex flex-column ga-3">
            <div class="step-index">{{ i + 1 }}</div>
            <h3 class="text-subtitle-1 font-weight-bold mb-0">{{ step.title }}</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ step.text }}</p>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- ============ AST / EXTENSIBILIDADE ============ -->
    <v-container id="open-source" class="px-4 px-md-8 py-10 py-md-14">
      <v-row align="center">
        <v-col cols="12" md="6">
          <v-chip size="small" variant="tonal" color="secondary" class="font-weight-medium mb-4">
            Arquitetura
          </v-chip>
          <h2 class="display-text text-h4 mb-4">
            Por trás dos nodes, uma árvore sintática
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4 max-width-560">
            Cada projeto que você monta vira uma AST (árvore de sintaxe abstrata) —
            a mesma estrutura que motores de linguagem usam por baixo dos panos.
            Hoje ela é traduzida para JavaScript. Como a lógica não depende da
            sintaxe de uma linguagem específica, suportar Python, Lua ou outras
            linguagens é uma questão de adicionar um novo tradutor, não de
            reescrever o editor.
          </p>
          <v-btn variant="outlined" class="text-none" prepend-icon="code" href="https://github.com" target="_blank">
            Ler sobre a arquitetura no GitHub
          </v-btn>
        </v-col>

        <v-col cols="12" md="6" class="mt-8 mt-md-0">
          <div class="ast-shell pa-5 pa-md-6">
            <div class="d-flex align-center ga-2 mb-4">
              <div class="icon-squircle icon-squircle--secondary">
                <v-icon color="secondary" size="20">account_tree</v-icon>
              </div>
              <span class="text-subtitle-2 font-weight-bold">Um modelo, várias saídas</span>
            </div>

            <div class="ast-row">
              <span class="ast-pill ast-pill--active">AST</span>
              <v-icon size="18" class="mx-1 text-medium-emphasis">arrow_forward</v-icon>
              <span class="ast-pill ast-pill--ready">JavaScript</span>
            </div>
            <div class="ast-row">
              <span class="ast-pill ast-pill--ghost"></span>
              <v-icon size="18" class="mx-1 text-medium-emphasis">arrow_forward</v-icon>
              <span class="ast-pill ast-pill--soon">Python <em>(planejado)</em></span>
            </div>
            <div class="ast-row">
              <span class="ast-pill ast-pill--ghost"></span>
              <v-icon size="18" class="mx-1 text-medium-emphasis">arrow_forward</v-icon>
              <span class="ast-pill ast-pill--soon">Lua <em>(planejado)</em></span>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- ============ CTA FINAL ============ -->
    <v-container class="px-4 px-md-8 py-10 py-md-14">
      <div class="hero-shell pa-8 pa-md-10 position-relative overflow-hidden text-center">
        <div class="blob-cluster" aria-hidden="true">
          <span class="blob blob-a"></span>
          <span class="blob blob-b"></span>
          <span class="blob blob-c"></span>
        </div>

        <div class="position-relative" style="z-index: 2;">
          <h2 class="display-text text-h4 text-md-h3 mb-4">
            Comece a programar sem custo nenhum
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-6 mx-auto" style="max-width: 480px;">
            Crie uma conta, monte seu primeiro fluxo de nodes e veja o código
            rodando. Tudo salvo na nuvem automaticamente, para sempre, de graça.
          </p>
          <v-btn color="primary" size="x-large" class="text-none" append-icon="arrow_forward" to="/register">
            Criar minha conta
          </v-btn>
        </div>
      </div>
    </v-container>

    <!-- ============ FOOTER ============ -->
    <v-container class="px-4 px-md-8 py-8">
      <v-divider class="mb-6" />
      <div class="d-flex flex-wrap justify-space-between align-center ga-4">
        <div class="d-flex align-center ga-2">
          <div class="icon-squircle">
            <v-icon color="primary" size="18">hub</v-icon>
          </div>
          <span class="text-body-2 font-weight-medium">Creatio</span>
          <span class="text-caption text-medium-emphasis ml-2">Editor visual de código, open source</span>
        </div>
        <div class="d-flex ga-4">
          <v-btn variant="text" size="small" class="text-none" href="https://github.com" target="_blank">GitHub</v-btn>
          <v-btn variant="text" size="small" class="text-none" href="#como-funciona">Como funciona</v-btn>
          <v-btn variant="text" size="small" class="text-none" to="/community">Comunidade</v-btn>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
const features = [
  {
    icon: "hub",
    color: "primary",
    title: "Aprendizado por nodes",
    text: "Cada bloco representa um passo real do código. Você monta a lógica e vê o fluxo dos dados, em vez de decorar sintaxe.",
  },
  {
    icon: "javascript",
    color: "secondary",
    title: "JavaScript de verdade por baixo",
    text: "O que você monta nos nodes roda como JS de verdade no navegador. Nada de simulação — é o código real.",
  },
  {
    icon: "cloud_done",
    color: "tertiary",
    title: "Tudo salvo na nuvem, de graça",
    text: "Seus projetos ficam salvos automaticamente. Sem plano pago, sem limite escondido, sem perder nada ao trocar de dispositivo.",
  },
  {
    icon: "code",
    color: "primary",
    title: "Código aberto, sempre",
    text: "O editor inteiro é open source. Qualquer pessoa pode ler, estudar ou contribuir com o projeto.",
  },
];

const steps = [
  {
    title: "Arraste os nodes",
    text: "Monte a lógica visualmente, sem escrever uma linha de sintaxe.",
  },
  {
    title: "Conecte os fluxos",
    text: "Defina como os dados passam de um bloco para o outro.",
  },
  {
    title: "Execute e veja o resultado",
    text: "O código roda na hora, direto no navegador.",
  },
  {
    title: "Pronto — já está salvo",
    text: "Cada alteração vai para a nuvem sozinha, sem precisar clicar em nada.",
  },
];
</script>

<style scoped>
.landing-view {
  font-family: var(--body-font, inherit);
}

.dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.max-width-560 {
  max-width: 560px;
}

/* ---------- Hero node graph (assinatura visual desta página) ---------- */
.node-graph-shell {
  background: rgba(var(--v-theme-surface-variant), 0.35);
  border-radius: 32px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.node-graph {
  width: 100%;
  height: auto;
  display: block;
}

.node-box {
  fill: rgba(var(--v-theme-surface), 1);
  stroke-width: 1.5;
}

.node-primary {
  stroke: rgb(var(--v-theme-primary));
}
.node-secondary {
  stroke: rgb(var(--v-theme-secondary));
}
.node-tertiary {
  stroke: rgb(var(--v-theme-tertiary));
}

.node-label {
  font-size: 13px;
  font-weight: 600;
  font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  fill: rgb(var(--v-theme-on-surface));
}

.flow-line {
  fill: none;
  stroke: rgba(var(--v-theme-primary), 0.45);
  stroke-width: 2;
  stroke-dasharray: 6 6;
  animation: flowDash 2.4s linear infinite;
}

@keyframes flowDash {
  to {
    stroke-dashoffset: -24;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flow-line {
    animation: none;
  }
}

/* ---------- Feature cards ---------- */
.feature-card {
  background: rgba(var(--v-theme-surface-variant), 0.35);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.icon-squircle--secondary {
  background: rgba(var(--v-theme-secondary), 0.14);
}
.icon-squircle--tertiary {
  background: rgba(var(--v-theme-tertiary), 0.14);
}

/* ---------- Como funciona: índice numerado legítimo (passo a passo real) ---------- */
.step-index {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  font-weight: 800;
}

/* ---------- AST diagram ---------- */
.ast-shell {
  background: rgba(var(--v-theme-surface-variant), 0.35);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 28px;
}

.ast-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.ast-pill {
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 0.85rem;
  font-weight: 600;
}

.ast-pill--active {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.ast-pill--ready {
  background: rgba(var(--v-theme-primary), 0.14);
  color: rgb(var(--v-theme-primary));
}

.ast-pill--soon {
  background: transparent;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.25);
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.ast-pill--ghost {
  width: 40px;
  padding: 6px 0;
  background: rgba(var(--v-theme-on-surface), 0.06);
}
</style>
