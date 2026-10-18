export { createReteEditor } from './setup';
export { safeSerialize } from './serialize';
export type { ReteEditorInstance, CreateReteEditorOptions } from './setup';
export type { NodeEditor } from 'rete';

// Re-exporta AreaExtensions para que consumidores (ex: ComponentNode.vue) possam
// usar zoomAt e demais utilitários sem importar rete-area-plugin diretamente.
export { AreaExtensions } from 'rete-area-plugin';
