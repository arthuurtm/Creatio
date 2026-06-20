import {
  AritmeticOperators,
  ComparisonOperators,
  LogicalOperators,
  type SDKNodeType,
  type EditorContext,
  type ExecuteResult,
} from '../';

export default (ctx: EditorContext) => ({
  text: 'Funções',
  icon: 'functions',
  definitions: {
    defineFunction: {
      text: 'Definir Função',
      icon: 'function',
      params: [
        { key: 'name', label: 'Nome da Função', type: 'text', required: true },
        { key: 'isAsync', label: 'Assíncrona?', type: 'switch', default: false },
        {
          key: 'args',
          label: 'Parâmetros',
          type: 'complex-array',
          items: [
            { key: 'variable', label: 'Variável', type: 'select', items: ctx.variables },
            { key: 'arithmetic', label: 'Operadores Aritméticos', type: 'select', items: AritmeticOperators },
            { key: 'comparison', label: 'Operadores de Comparação', type: 'select', items: ComparisonOperators },
            { key: 'logical', label: 'Operadores Lógicos', type: 'select', items: LogicalOperators },
          ],
        },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'functions' as SDKNodeType,
        category: 'FUNCTION_DEFINITION',
        params: {
          name: p.name,
          isAsync: p.isAsync,
          arguments: p.args ? p.args.split(',').map((a: string) => a.trim()) : [],
        },
        hasScope: true,
      }),
    },

    callFunction: {
      text: 'Chamar Função',
      icon: 'play_circle',
      params: [
        { key: 'funcName', label: 'Função', type: 'select', items: ctx.functions, required: true },
        { key: 'shouldAwait', label: 'Esperar (await)?', type: 'switch', default: false },
        { key: 'args', label: 'Valores', type: 'text' },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'functions' as SDKNodeType,
        category: 'FUNCTION_CALL',
        params: { name: p.funcName, await: p.shouldAwait, arguments: p.args },
        isExpression: true,
        connectExecution: p.funcName,
      }),
    },

    returnValue: {
      text: 'Retornar Valor',
      icon: 'keyboard_return',
      params: [{ key: 'value', label: 'Valor', type: 'text' }],
      execute: (p: any): ExecuteResult => ({
        type: 'functions' as SDKNodeType,
        category: 'FUNCTION_RETURN',
        params: { value: p.value || 'undefined' },
      }),
    },

    consoleLog: {
      text: 'Imprimir na Tela (Log)',
      icon: 'terminal',
      params: [{ key: 'message', label: 'Mensagem ou Variável', type: 'text', required: true }],
      execute: (p: any): ExecuteResult => ({
        type: 'functions' as SDKNodeType,
        category: 'CONSOLE_LOG',
        params: { message: p.message },
      }),
    },
  },
});
