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
 *
 * Regras seguidas para o conversor código → grafo do rete-studio aceitar:
 *   1. Sem comentários dentro do código (viram nós no AST e podem quebrar a conversão).
 *   2. Todo identificador usado é declarado no próprio snippet.
 *   3. Apenas construções que existem nos snippets nativos do rete-studio
 *      (variáveis, if, for, while, function, return, array, try/catch, console.log).
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
        code: "let variavel = 42;\nconsole.log(variavel);",
      },
    ],
  },
  {
    label: "Decisões (Se / Senão)",
    subitems: [
      {
        label: "Se (simples)",
        code: 'let condicao = true;\nif (condicao) {\n  console.log("verdadeiro");\n}',
      },
      {
        label: "Se / Senão",
        code: 'let condicao = true;\nif (condicao) {\n  console.log("verdadeiro");\n} else {\n  console.log("falso");\n}',
      },
    ],
  },
  {
    label: "Repetições (Laços)",
    subitems: [
      {
        label: "Repetir N vezes (for)",
        code: "for (let i = 0; i < 10; i++) {\n  console.log(i);\n}",
      },
      {
        label: "Repetir enquanto (while)",
        code: "let contador = 3;\nwhile (contador > 0) {\n  console.log(contador);\n  contador--;\n}",
      },
      {
        label: "Para cada item da lista",
        code: "let lista = [1, 2, 3];\nfor (let i = 0; i < lista.length; i++) {\n  console.log(lista[i]);\n}",
      },
    ],
  },
  {
    label: "Funções",
    subitems: [
      {
        label: "Criar uma função",
        code: 'function minhaFuncao() {\n  console.log("Olá!");\n}',
      },
      {
        label: "Função com parâmetro",
        code: "function somar(a, b) {\n  return a + b;\n}",
      },
      {
        label: "Criar e chamar uma função",
        code: 'function minhaFuncao() {\n  console.log("Olá!");\n}\nminhaFuncao();',
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
        code: "let lista = [1, 2, 3];\nlista.push(4);",
      },
      {
        label: "Pegar o tamanho da lista",
        code: "let lista = [1, 2, 3];\nlet tamanho = lista.length;",
      },
      {
        label: "Pegar um item pelo índice",
        code: "let lista = [1, 2, 3];\nlet primeiro = lista[0];",
      },
    ],
  },
  {
    label: "Cálculos",
    subitems: [
      {
        label: "Somar",
        code: "let a = 10;\nlet b = 5;\nlet resultado = a + b;",
      },
      {
        label: "Subtrair",
        code: "let a = 10;\nlet b = 5;\nlet resultado = a - b;",
      },
      {
        label: "Multiplicar",
        code: "let a = 10;\nlet b = 5;\nlet resultado = a * b;",
      },
      {
        label: "Dividir",
        code: "let a = 10;\nlet b = 5;\nlet resultado = a / b;",
      },
      {
        label: "Resto da divisão",
        code: "let a = 10;\nlet b = 3;\nlet resto = a % b;",
      },
    ],
  },
  {
    label: "Tratamento de Erros",
    subitems: [
      {
        label: "Tentar / Capturar erro",
        code: 'try {\n  console.log("tentando...");\n} catch (erro) {\n  console.log(erro);\n}',
      },
    ],
  },
];

/**
 * Snippets que NÃO existem entre os nativos do rete-studio e que podem não ter
 * conversor para grafo. Ficam fora do catálogo até serem testados com
 * `testBeginnerSnippets()`. Para ativar, mova o item para `beginnerSnippets`.
 */
// const experimentalSnippets = [
//   { label: "Escolha um caso (switch)", code: 'let valor = 1;\nswitch (valor) {\n  case 1:\n    console.log("um");\n    break;\n  default:\n    console.log("outro");\n    break;\n}' },
//   { label: "Faça ao menos uma vez (do while)", code: "let i = 0;\ndo {\n  i++;\n} while (i < 3);" },
//   { label: "Para cada item (for of)", code: "let lista = [1, 2, 3];\nfor (let item of lista) {\n  console.log(item);\n}" },
// ];

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
export * from './controls';
