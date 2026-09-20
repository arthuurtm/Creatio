import type { SDKNodeType, EditorContext, ExecuteResult } from '../models';
import { DeclarationKeywords, AritmeticOperators, ComparisonOperators, LogicalOperators } from '../tokens';

function formatCondition(condition: any): string {
  if (!condition) return "";
  if (typeof condition === "string") return condition;
  if (Array.isArray(condition)) {
    return condition
      .map((item: any) => {
        if (!item) return "";
        if (typeof item === "string") return item;
        if (typeof item === "object") {
          return item.text || item.value || item.name || item.label || "";
        }
        return String(item);
      })
      .filter(Boolean)
      .join(" ");
  }
  if (typeof condition === "object") {
    return condition.text || condition.value || condition.name || condition.label || "";
  }
  return String(condition);
}

export default (ctx: EditorContext) => ({
  text: 'Variáveis',
  icon: 'abc',
  definitions: {
    declare: {
      text: 'Declarar Variável',
      icon: 'add_box',
      description: 'Cria uma nova variável no escopo (let, const, var) com um valor inicial.',
      preview: 'let variavel = valor;',
      params: [
        { key: 'kind', label: 'Tipo', type: 'select', options: Object.values(DeclarationKeywords), default: 'let' },
        { key: 'name', label: 'Nome', type: 'text', required: true },
        { key: 'value', label: 'Valor Inicial', type: 'text', default: 'null' },
      ],
      execute: (p: any): ExecuteResult => ({
        type: 'variables' as SDKNodeType,
        category: 'VARIABLE_DECLARATION',
        params: { kind: p.kind, name: p.name, value: p?.value ?? 'null' },
        // AST ESTree nativa para o compilador genérico
        estree: {
          type: "VariableDeclaration",
          kind: p.kind || "let",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: p.name },
              init: { type: "Identifier", name: p.value ?? "null" }
            }
          ]
        }
      }),
    },

    assign: {
      text: 'Atribuir / Calcular',
      icon: 'edit',
      description: 'Atribui um valor a uma variável existente. Você pode fazer cálculos infinitos adicionando operadores e valores.',
      preview: 'variavel = expressao;',
      params: [
        { key: 'varId', label: 'Variável', type: 'select', options: ctx.variables, required: true },
        {
          key: 'value',
          label: 'Expressão / Cálculo',
          type: 'expression',
          options: [
            { key: 'variable', label: 'Variável', type: 'select', options: ctx.variables },
            { key: 'number', label: 'Valor', type: 'number' },
            { key: 'arithmetic', label: 'Operadores Aritméticos', type: 'select', options: AritmeticOperators },
            { key: 'comparison', label: 'Operadores de Comparação', type: 'select', options: ComparisonOperators },
            { key: 'logical', label: 'Operadores Lógicos', type: 'select', options: LogicalOperators },
          ],
          required: true
        },
      ],
      execute: (p: any): ExecuteResult => {
        const val = formatCondition(p.value) || 'null';

        return {
          type: 'variables' as SDKNodeType,
          category: 'VARIABLE_ASSIGNMENT',
          params: {
            varId: p.varId,
            value: val
          },
          connectData: p.varId,
          // AST ESTree nativa para o compilador genérico
          estree: {
            type: "ExpressionStatement",
            expression: {
              type: "AssignmentExpression",
              operator: "=",
              left: { type: "Identifier", name: p.varId },
              right: { type: "Identifier", name: val }
            }
          }
        };
      }
    },
  },
});
