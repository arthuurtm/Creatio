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
      params: [
        {
          key: 'condition',
          label: 'Condição',
          type: 'expression',
          items: [
            { key: 'variable', label: 'Variável', type: 'select', items: ctx.variables },
            { key: 'arithmetic', label: 'Operadores Aritméticos', type: 'select', items: AritmeticOperators },
            { key: 'comparison', label: 'Operadores de Comparação', type: 'select', items: ComparisonOperators },
            { key: 'logical', label: 'Operadores Lógicos', type: 'select', items: LogicalOperators },
          ],
          required: true,
        },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'IF_STATEMENT',
        params: { condition: p.condition },
        hasScope: true,
      }),
    },

    elseIf: {
      text: 'Senão Se',
      icon: 'call_split',
      params: [
        {
          key: 'condition',
          label: 'Condição',
          type: 'expression',
          items: [
            { key: 'variable', label: 'Variável', type: 'select', items: ctx.variables },
            { key: 'arithmetic', label: 'Operadores Aritméticos', type: 'select', items: AritmeticOperators },
            { key: 'comparison', label: 'Operadores de Comparação', type: 'select', items: ComparisonOperators },
            { key: 'logical', label: 'Operadores Lógicos', type: 'select', items: LogicalOperators },
          ],
          required: true,
        },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'ELSEIF_STATEMENT',
        params: { condition: p.condition },
        hasScope: true,
      }),
    },

    forLoop: {
      text: 'Laço For',
      icon: 'repeat',
      params: [
        { key: 'iteratorName', label: 'Variável Contadora (ex: i)', type: 'text', default: 'i', required: true },
        { key: 'startValue', label: 'Valor Inicial', type: 'text', default: '0', required: true },
        {
          key: 'condition', label: 'Condição (ex: i < 10)', type: 'expression', default: [],
          items: [
            { key: 'variable', label: 'Variável', type: 'select', items: ctx.variables },
            { key: 'arithmetic', label: 'Operadores Aritméticos', type: 'select', items: AritmeticOperators },
            { key: 'comparison', label: 'Operadores de Comparação', type: 'select', items: ComparisonOperators },
            { key: 'logical', label: 'Operadores Lógicos', type: 'select', items: LogicalOperators },
          ],
        },
        { key: 'step', label: 'Incremento (ex: i++)', type: 'text', default: 'i++' },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'FOR_LOOP',
        params: { iterator: p.iteratorName, start: p.startValue, condition: p.condition, step: p.step },
        hasScope: true,
      }),
    },

    whileLoop: {
      text: 'Laço Enquanto (While)',
      icon: 'sync',
      params: [
        {
          key: 'condition',
          label: 'Condição',
          type: 'expression',
          items: [
            { key: 'variable', label: 'Variável', type: 'select', items: ctx.variables },
            { key: 'arithmetic', label: 'Operadores Aritméticos', type: 'select', items: AritmeticOperators },
            { key: 'comparison', label: 'Operadores de Comparação', type: 'select', items: ComparisonOperators },
            { key: 'logical', label: 'Operadores Lógicos', type: 'select', items: LogicalOperators },
          ],
          required: true,
        },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'WHILE_LOOP',
        params: { condition: p.condition },
        hasScope: true,
      }),
    },

    break: {
      text: 'Parar Laço (Break)',
      icon: 'cancel',
      params: [],
      execute: (): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'BREAK_STATEMENT',
        params: {},
      }),
    },

    continue: {
      text: 'Pular Iteração (Continue)',
      icon: 'skip_next',
      params: [],
      execute: (): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'CONTINUE_STATEMENT',
        params: {},
      }),
    },

    switchCase: {
      text: 'Escolha (Switch)',
      icon: 'switch_access_shortcut',
      params: [
        { key: 'expression', label: 'Variável/Expressão', type: 'expression', required: true },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'SWITCH_STATEMENT',
        params: { expression: p.expression },
        hasScope: true,
      }),
    },

    switchCaseOption: {
      text: 'Caso (Case)',
      icon: 'subdirectory_arrow_right',
      params: [
        { key: 'parentId', label: 'Pertence a qual Switch?', type: 'select', items: ctx.logics, required: true },
        { key: 'value', label: 'Valor', type: 'text', required: true },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'CASE_CONDITION',
        // ✅ parentId aqui é CORRETO — Case é visualmente filho do Switch
        parentId: p.parentId,
        params: { value: p.value },
        autoBreak: true,
      }),
    },

    switchCaseDefault: {
      text: 'Caso Padrão (Default)',
      icon: 'subdirectory_arrow_right',
      params: [
        { key: 'parentId', label: 'Pertence a qual Switch?', type: 'select', items: ctx.logics, required: true },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'logics' as SDKNodeType,
        category: 'CASE_DEFAULT',
        // ✅ parentId aqui é CORRETO — Default é visualmente filho do Switch
        parentId: p.parentId,
        params: {},
        autoBreak: true,
      }),
    },
  },
});
