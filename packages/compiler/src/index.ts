import { createAdapter } from 'rete-studio-core';
import * as javascriptLang from 'rete-studio-javascript-lang';

/**
 * Instância do adapter do rete-studio para JavaScript.
 * Expõe as operações principais:
 *   - graphToCode(EditorState)  → string de código JS
 *   - codeToGraph(string)       → EditorState (nodes + connections)
 *   - codeToExecutable(string)  → string de código JS executável (purificado)
 *   - getSnippets()             → lista de snippets disponíveis
 */
const originalAdapter = createAdapter(javascriptLang);

/**
 * Snippets amigáveis em português para iniciantes.
 * Ficam no topo do catálogo como blocos padrão.
 */
const beginnerSnippets = [
  {
    label: "Variáveis",
    subitems: [
      {
        label: "Guardar um número",
        code: "let numero = 10;",
      },
      {
        label: "Guardar um texto",
        code: 'let texto = "Olá, mundo!";',
      },
      {
        label: "Guardar verdadeiro/falso",
        code: "let ligado = true;",
      },
      {
        label: "Constante (não muda)",
        code: "const PI = 3.14;",
      },
    ],
  },
  {
    label: "Mostrar na Tela",
    subitems: [
      {
        label: "Escrever no console",
        code: 'console.log("Olá, mundo!");',
      },
      {
        label: "Mostrar uma variável",
        code: "console.log(variavel);",
      },
    ],
  },
  {
    label: "Decisões (Se / Senão)",
    subitems: [
      {
        label: "Se (simples)",
        code: "if (condicao) {\n  // faça algo\n}",
      },
      {
        label: "Se / Senão",
        code: "if (condicao) {\n  // faça algo\n} else {\n  // senão, faça outro\n}",
      },
      {
        label: "Escolha um caso",
        code: "switch (valor) {\n  case 1:\n    // caso 1\n    break;\n  case 2:\n    // caso 2\n    break;\n  default:\n    // padrão\n    break;\n}",
      },
    ],
  },
  {
    label: "Repetições (Laços)",
    subitems: [
      {
        label: "Repetir N vezes (for)",
        code: "for (let i = 0; i < 10; i++) {\n  // repita algo\n}",
      },
      {
        label: "Repetir enquanto (while)",
        code: "while (condicao) {\n  // repita enquanto verdadeiro\n}",
      },
      {
        label: "Faça ao menos uma vez (do while)",
        code: "do {\n  // executa ao menos uma vez\n} while (condicao);",
      },
      {
        label: "Para cada item da lista",
        code: "for (let item of lista) {\n  console.log(item);\n}",
      },
    ],
  },
  {
    label: "Funções",
    subitems: [
      {
        label: "Criar uma função",
        code: "function minhaFuncao() {\n  // faça algo\n}",
      },
      {
        label: "Função com parâmetro",
        code: "function somar(a, b) {\n  return a + b;\n}",
      },
      {
        label: "Chamar uma função",
        code: "minhaFuncao();",
      },
    ],
  },
  {
    label: "Listas (Arrays)",
    subitems: [
      {
        label: "Criar uma lista",
        code: "let lista = [1, 2, 3];",
      },
      {
        label: "Adicionar item à lista",
        code: "lista.push(novoItem);",
      },
      {
        label: "Pegar o tamanho da lista",
        code: "let tamanho = lista.length;",
      },
      {
        label: "Pegar um item pelo índice",
        code: "let primeiro = lista[0];",
      },
    ],
  },
  {
    label: "Cálculos",
    subitems: [
      {
        label: "Somar",
        code: "let resultado = a + b;",
      },
      {
        label: "Subtrair",
        code: "let resultado = a - b;",
      },
      {
        label: "Multiplicar",
        code: "let resultado = a * b;",
      },
      {
        label: "Dividir",
        code: "let resultado = a / b;",
      },
      {
        label: "Resto da divisão",
        code: "let resto = a % b;",
      },
    ],
  },
  {
    label: "Tratamento de Erros",
    subitems: [
      {
        label: "Tentar / Capturar erro",
        code: "try {\n  // código que pode dar erro\n} catch (erro) {\n  console.log(erro);\n}",
      },
    ],
  },
];

export const jsAdapter = {
  ...originalAdapter,
  getSnippets: async () => {
    const nativeSnippets = await originalAdapter.getSnippets();
    return [
      // Snippets amigáveis ficam no topo
      ...beginnerSnippets,
      // Snippets originais do Rete ficam no grupo "Avançado"
      {
        label: "Avançado",
        subitems: nativeSnippets as any[],
        advanced: true,
      },
    ];
  },
};

export type { LanguageAdapter, LanguageSnippet } from 'rete-studio-core';
