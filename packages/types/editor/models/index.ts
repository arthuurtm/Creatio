import type { Node, Edge } from '@vue-flow/core';

export type SDKNodeType = 'variables' | 'functions' | 'logics';


//    Usada em execute() para dizer à Store
//    "quando eu nascer, me conecte a X".

export type AutoConnectIntent =
  | {
      /** Conecta este nó como "filho de execução" de outro nó já existente */
      kind: 'execution';
      targetId: string;
    }
  | {
      kind: 'data';
      targetId: string;
      handleId?: string;
    };

export interface ASTNode {
  type: SDKNodeType;
  category: string;
  params?: Record<string, any>;
  /** Verdadeiro se este nó abre um bloco de escopo (If, For, etc.) */
  hasScope?: boolean;
  /** Quando verdadeiro, o transpilador trata este nó como expressão inline */
  isExpression?: boolean;
  /** ID do nó PAI no Vue Flow — apenas para aninhamento visual de escopo */
  parentId?: string;
  /** Se verdadeiro, insere automaticamente um comando break/retorno no fim do bloco */
  autoBreak?: boolean;
}

export interface ExecuteResult extends ASTNode {
  connectData?: string | string[];
  connectExecution?: string | string[];
}

export interface NodeBlueprintData {
  ast: ASTNode; // ← ASTNode puro, sem autoConnect
}

export type SDKNode = Node<NodeBlueprintData, any, SDKNodeType>;

export interface ConnectionData {
  type: 'execution' | 'data';
}

export type NodeConnection = Edge<ConnectionData>;

export interface FileInfo {
  id: number | null;
  title: string;
  version: string;
  description: string | null;
  updatedAt: Date | number | null;
}

export interface EditorState {
  info: FileInfo;
  /**
   * Array único de todos os nós.
   * Para filtrar por tipo: nodes.filter(n => n.type === 'variables')
   * Simplifica indexação, busca e serialização.
   */
  nodes: SDKNode[];
  connections: NodeConnection[];
}

// Atalhos de leitura que a config.ts (e os models) usam via ctx
export interface EditorContext extends EditorState {
  /** Conveniência: nós de variáveis já filtrados */
  variables: SDKNode[];
  /** Conveniência: nós de funções já filtrados */
  functions: SDKNode[];
  /** Conveniência: nós de lógica já filtrados */
  logics: SDKNode[];
}

export type CategoryKey = SDKNodeType;

export { default as functions } from './functions';
export { default as logics } from './logics';
export { default as variables } from './variables';
