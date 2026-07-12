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
      execute: (p: any): ExecuteResult => {
        const parsedArgs = p.args ? p.args.split(',').map((a: string) => a.trim()) : [];
        return {
          type: 'functions' as SDKNodeType,
          category: 'FUNCTION_DEFINITION',
          params: {
            name: p.name,
            isAsync: p.isAsync,
            arguments: parsedArgs,
          },
          hasScope: true,
          // Nó ESTree correspondente
          estree: {
            type: "FunctionDeclaration",
            id: { type: "Identifier", name: p.name },
            params: parsedArgs.map((arg: string) => ({ type: "Identifier", name: arg })),
            async: p.isAsync || false,
            body: {
              type: "BlockStatement",
              body: [] // Preenchido recursivamente pelo compilador genérico
            }
          }
        };
      },
    },

    callFunction: {
      text: 'Chamar Função',
      icon: 'play_circle',
      params: [
        { key: 'funcName', label: 'Função', type: 'select', items: ctx.functions, required: true },
        { key: 'shouldAwait', label: 'Esperar (await)?', type: 'switch', default: false },
        { key: 'args', label: 'Valores', type: 'text' },
      ],
      execute: (p: any): ExecuteResult => {
        const parsedArgs = p.args ? p.args.split(',').map((a: string) => a.trim()) : [];
        
        const callExpression: any = {
          type: "CallExpression",
          callee: { type: "Identifier", name: p.funcName },
          arguments: parsedArgs.map((arg: string) => ({ type: "Identifier", name: arg }))
        };

        const estreeNode = p.shouldAwait
          ? {
              type: "ExpressionStatement",
              expression: {
                type: "AwaitExpression",
                argument: callExpression
              }
            }
          : {
              type: "ExpressionStatement",
              expression: callExpression
            };

        return {
          type: 'functions' as SDKNodeType,
          category: 'FUNCTION_CALL',
          params: { name: p.funcName, await: p.shouldAwait, arguments: p.args },
          isExpression: true,
          connectExecution: p.funcName,
          // Nó ESTree correspondente
          estree: estreeNode
        };
      },
    },

    returnValue: {
      text: 'Retornar Valor',
      icon: 'keyboard_return',
      params: [{ key: 'value', label: 'Valor', type: 'text' }],
      execute: (p: any): ExecuteResult => ({
        type: 'functions' as SDKNodeType,
        category: 'FUNCTION_RETURN',
        params: { value: p.value || 'undefined' },
        // Nó ESTree correspondente
        estree: {
          type: "ReturnStatement",
          argument: p.value ? { type: "Identifier", name: p.value } : null
        }
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
        // Nó ESTree correspondente
        estree: {
          type: "ExpressionStatement",
          expression: {
            type: "CallExpression",
            callee: {
              type: "MemberExpression",
              object: { type: "Identifier", name: "console" },
              property: { type: "Identifier", name: "log" },
              computed: false
            },
            arguments: [{ type: "Identifier", name: p.message }]
          }
        }
      }),
    },
  },
});
