import {
  AritmeticOperators,
  ComparisonOperators,
  LogicalOperators,
  type SDKNodeType,
  type EditorContext,
  type ExecuteResult,
} from '../';

export default (ctx: EditorContext) => ({
  text: 'Lógicas de Controle',
  icon: 'alt_route',
  definitions: {
    if: {
      text: 'Se',
      icon: 'alt_route',
      description: 'Executa um bloco de código somente se uma condição específica for verdadeira.',
      preview: 'if (condicao) {\n  // código\n}',
      params: [
        {
          key: 'condition',
          label: 'Condição',
          type: 'expression',
          options: [
            { key: 'variable', label: 'Variável', type: 'select', options: ctx.variables },
            { key: 'arithmetic', label: 'Operadores Aritméticos', type: 'select', options: AritmeticOperators },
            { key: 'comparison', label: 'Operadores de Comparação', type: 'select', options: ComparisonOperators },
            { key: 'logical', label: 'Operadores Lógicos', type: 'select', options: LogicalOperators },
          ],
          required: true,
        },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'IF_STATEMENT',
        params: { condition: p.condition },
        hasScope: true,
        // Nó ESTree correspondente
        estree: {
          type: "IfStatement",
          test: { type: "Identifier", name: p.condition },
          consequent: {
            type: "BlockStatement",
            body: [] // Preenchido recursivamente pelo compilador
          },
          alternate: null
        }
      }),
    },

    elseIf: {
      text: 'Senão Se',
      icon: 'call_split',
      description: 'Verifica uma condição alternativa caso o bloco \'Se\' anterior falhe.',
      preview: 'else if (condicao) {\n  // código\n}',
      params: [
        {
          key: 'condition',
          label: 'Condição',
          type: 'expression',
          options: [
            { key: 'variable', label: 'Variável', type: 'select', options: ctx.variables },
            { key: 'arithmetic', label: 'Operadores Aritméticos', type: 'select', options: AritmeticOperators },
            { key: 'comparison', label: 'Operadores de Comparação', type: 'select', options: ComparisonOperators },
            { key: 'logical', label: 'Operadores Lógicos', type: 'select', options: LogicalOperators },
          ],
          required: true,
        },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'ELSEIF_STATEMENT',
        params: { condition: p.condition },
        hasScope: true,
        // Nó ESTree temporário. O compilador mescla isso no If anterior.
        estree: {
          type: "ElseIfStatement",
          test: { type: "Identifier", name: p.condition },
          consequent: {
            type: "BlockStatement",
            body: []
          }
        }
      }),
    },

    forLoop: {
      text: 'Laço For',
      icon: 'repeat',
      description: 'Repete instruções um número definido de vezes usando uma variável contadora.',
      preview: 'for (let i = 0; i < 10; i++) {\n  // código\n}',
      params: [
        { key: 'iteratorName', label: 'Variável Contadora (ex: i)', type: 'text', default: 'i', required: true },
        { key: 'startValue', label: 'Valor Inicial', type: 'text', default: '0', required: true },
        {
          key: 'condition', label: 'Condição (ex: i < 10)', type: 'expression', default: [],
          options: [
            { key: 'variable', label: 'Variável', type: 'select', options: ctx.variables },
            { key: 'arithmetic', label: 'Operadores Aritméticos', type: 'select', options: AritmeticOperators },
            { key: 'comparison', label: 'Operadores de Comparação', type: 'select', options: ComparisonOperators },
            { key: 'logical', label: 'Operadores Lógicos', type: 'select', options: LogicalOperators },
          ],
        },
        { key: 'step', label: 'Incremento (ex: i++)', type: 'text', default: 'i++' },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'FOR_LOOP',
        params: { iterator: p.iteratorName, start: p.startValue, condition: p.condition, step: p.step },
        hasScope: true,
        // Nó ESTree correspondente
        estree: {
          type: "ForStatement",
          init: {
            type: "VariableDeclaration",
            kind: "let",
            declarations: [{
              type: "VariableDeclarator",
              id: { type: "Identifier", name: p.iteratorName },
              init: { type: "Identifier", name: p.startValue }
            }]
          },
          test: { type: "Identifier", name: p.condition },
          update: { type: "Identifier", name: p.step },
          body: {
            type: "BlockStatement",
            body: []
          }
        }
      }),
    },

    whileLoop: {
      text: 'Laço Enquanto (While)',
      icon: 'sync',
      description: 'Repete instruções continuamente enquanto uma condição for verdadeira.',
      preview: 'while (condicao) {\n  // código\n}',
      params: [
        {
          key: 'condition',
          label: 'Condição',
          type: 'expression',
          options: [
            { key: 'variable', label: 'Variável', type: 'select', options: ctx.variables },
            { key: 'arithmetic', label: 'Operadores Aritméticos', type: 'select', options: AritmeticOperators },
            { key: 'comparison', label: 'Operadores de Comparação', type: 'select', options: ComparisonOperators },
            { key: 'logical', label: 'Operadores Lógicos', type: 'select', options: LogicalOperators },
          ],
          required: true,
        },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'WHILE_LOOP',
        params: { condition: p.condition },
        hasScope: true,
        // Nó ESTree correspondente
        estree: {
          type: "WhileStatement",
          test: { type: "Identifier", name: p.condition },
          body: {
            type: "BlockStatement",
            body: []
          }
        }
      }),
    },

    break: {
      text: 'Parar Laço (Break)',
      icon: 'cancel',
      description: 'Interrompe imediatamente a execução do laço de repetição atual.',
      preview: 'break;',
      params: [],
      execute: (): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'BREAK_STATEMENT',
        params: {},
        // Nó ESTree correspondente
        estree: {
          type: "BreakStatement",
          label: null
        }
      }),
    },

    continue: {
      text: 'Pular Iteração (Continue)',
      icon: 'skip_next',
      description: 'Pula para a próxima iteração do laço de repetição atual.',
      preview: 'continue;',
      params: [],
      execute: (): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'CONTINUE_STATEMENT',
        params: {},
        // Nó ESTree correspondente
        estree: {
          type: "ContinueStatement",
          label: null
        }
      }),
    },

    switchCase: {
      text: 'Escolha (Switch)',
      icon: 'switch_access_shortcut',
      description: 'Avalia uma expressão e desvia a execução para o caso correspondente.',
      preview: 'switch (expressao) {\n  // casos\n}',
      params: [
        { key: 'expression', label: 'Variável/Expressão', type: 'expression', required: true },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'SWITCH_STATEMENT',
        params: { expression: p.expression },
        hasScope: true,
        // Nó ESTree correspondente
        estree: {
          type: "SwitchStatement",
          discriminant: { type: "Identifier", name: p.expression },
          cases: []
        }
      }),
    },

    switchCaseOption: {
      text: 'Caso (Case)',
      icon: 'subdirectory_arrow_right',
      description: 'Define um caso de correspondência específico para um bloco Escolha.',
      preview: 'case valor:\n  // código\n  break;',
      params: [
        { key: 'parentId', label: 'Pertence a qual Switch?', type: 'select', options: ctx.logics, required: true },
        { key: 'value', label: 'Valor', type: 'text', required: true },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'CASE_CONDITION',
        parentId: p.parentId,
        params: { value: p.value },
        autoBreak: true,
        hasScope: true,
        // Nó ESTree correspondente (SwitchCase)
        estree: {
          type: "SwitchCase",
          test: { type: "Identifier", name: p.value },
          consequent: []
        }
      }),
    },

    switchCaseDefault: {
      text: 'Caso Padrão (Default)',
      icon: 'subdirectory_arrow_right',
      description: 'Define o caso padrão executado se nenhuma opção for atendida.',
      preview: 'default:\n  // código\n  break;',
      params: [
        { key: 'parentId', label: 'Pertence a qual Switch?', type: 'select', options: ctx.logics, required: true },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'CASE_DEFAULT',
        parentId: p.parentId,
        params: {},
        autoBreak: true,
        hasScope: true,
        // Nó ESTree correspondente (SwitchCase Default)
        estree: {
          type: "SwitchCase",
          test: null,
          consequent: []
        }
      }),
    },
  },
});
