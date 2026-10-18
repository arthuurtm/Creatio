export type ControlKind =
  | 'text' | 'number' | 'textarea' | 'boolean'
  | 'slider' | 'color' | 'label'
  | 'select' | 'insert' | 'unknown';

/**
 * Identifica o tipo pela forma do objeto (duck typing evita problemas de
 * instanceof entre bundles). Usado tanto pelo CustomControl quanto pelo nó,
 * para o nó saber se o controle será exibido ou não.
 */
export function detectControlKind(d: any): ControlKind {
  if (!d) return 'unknown';

  if (Array.isArray(d.options)) return 'select';

  const type = d.options?.type || d.type;

  switch (type) {
    case 'identifier':
    case 'text':
    case 'string':
      return 'text';
    case 'number':
      return 'number';
    case 'textarea':
      return 'textarea';
    case 'boolean':
    case 'checkbox':
    case 'switch':
      return 'boolean';
    case 'range':
    case 'slider':
      return 'slider';
    case 'color':
      return 'color';
    case 'label':
      return 'label';
  }

  if (typeof d.onClick === 'function') return 'insert';
  if (typeof d.setValue === 'function' || 'value' in d) return 'text';

  return 'unknown';
}

/** Controles que o usuário realmente enxerga/edita no nó. */
export function isRenderableControl(control: unknown): boolean {
  return !!control && detectControlKind(control) !== 'unknown';
}

/** Controles que precisam de um rótulo acima (label e botão já se explicam). */
export function needsFieldLabel(control: unknown): boolean {
  const kind = detectControlKind(control);
  return kind !== 'unknown' && kind !== 'label' && kind !== 'insert';
}

/**
 * Tradução dos nomes técnicos dos campos para algo que um iniciante entenda.
 * As chaves são palpites baseados em nomes comuns de AST: se algum campo
 * continuar com nome em inglês na tela, basta adicionar a chave aqui.
 */
const LABELS_PT: Record<string, string> = {
  name: 'Nome',
  identifier: 'Nome',
  id: 'Nome',
  variable: 'Variável',
  ref: 'Variável',
  value: 'Valor',
  init: 'Valor inicial',
  initial: 'Valor inicial',
  kind: 'Tipo',
  test: 'Condição',
  condition: 'Condição',
  consequent: 'Então',
  alternate: 'Senão',
  body: 'Corpo',
  params: 'Parâmetros',
  param: 'Parâmetro',
  arguments: 'Argumentos',
  args: 'Argumentos',
  argument: 'Argumento',
  callee: 'Função',
  left: 'Esquerda',
  right: 'Direita',
  operator: 'Operador',
  object: 'Objeto',
  property: 'Propriedade',
  update: 'Passo',
  elements: 'Itens',
  result: 'Resultado',
  return: 'Retorno',
  next: 'Próximo',
  in: 'Entrada',
  out: 'Saída'
};

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function fieldLabel(key: string, label?: unknown): string {
  const raw = String(label ?? '').trim();
  const byLabel = raw ? LABELS_PT[raw.toLowerCase()] : undefined;
  if (byLabel) return byLabel;

  const byKey = LABELS_PT[String(key ?? '').trim().toLowerCase()];
  if (byKey) return byKey;

  return capitalize(raw || String(key ?? ''));
}
