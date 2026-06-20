import type { SDKNodeType, EditorContext, ExecuteResult } from '../models';

export default (ctx: EditorContext) => ({
  text: 'Variáveis',
  icon: 'abc',
  definitions: {
    declare: {
      text: 'Declarar Variável',
      icon: 'add_box',
      params: [
        { key: 'kind', label: 'Tipo', type: 'select', items: ['const', 'let', 'var'], default: 'let' },
        { key: 'name', label: 'Nome', type: 'text', required: true },
        { key: 'value', label: 'Valor Inicial', type: 'text', default: 'null' },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'variables' as SDKNodeType,
        category: 'VARIABLE_DECLARATION',
        params: { kind: p.kind, name: p.name, value: p?.value ?? 'null' },
        // Sem autoConnect: declaração é o "root" de uma variável
      }),
    },

    assign: {
      text: 'Atribuir Valor',
      icon: 'edit',
      params: [
        { key: 'varId', label: 'Variável', type: 'select', items: ctx.variables, required: true },
        { key: 'value', label: 'Novo Valor', type: 'text', required: true },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'variables' as SDKNodeType,
        category: 'VARIABLE_ASSIGNMENT',
        params: { varId: p.varId, value: p.value },
        connectData: p.varId,
      }),
    },

    mathOperation: {
      text: 'Operação Matemática',
      icon: 'calculate',
      params: [
        { key: 'targetVar', label: 'Salvar na Variável', type: 'select', items: ctx.variables, required: true },
        { key: 'valA', label: 'Valor A (ou Variável)', type: 'text', required: true },
        { key: 'operator', label: 'Operador', type: 'select', items: ['+', '-', '*', '/', '%'], required: true },
        { key: 'valB', label: 'Valor B (ou Variável)', type: 'text', required: true },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'variables' as SDKNodeType,
        category: 'MATH_OPERATION',
        params: { targetVar: p.targetVar, valA: p.valA, operator: p.operator, valB: p.valB },
        connectData: p.targetVar,
      }),
    },
  },
});
