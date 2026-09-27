export type SDKNodeType = 'variables' | 'functions' | 'logics';

export type AutoConnectIntent =
  | {
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
  hasScope?: boolean;
  isExpression?: boolean;
  parentId?: string;
  autoBreak?: boolean;
  estree?: Record<string, any>;
}

export interface ExecuteResult extends ASTNode {
  connectData?: string | string[];
  connectExecution?: string | string[];
}

export type NodeBlueprintData = ASTNode;

export interface SDKNode {
  id: string;
  type: SDKNodeType;
  position: { x: number; y: number };
  data: NodeBlueprintData;
  parentNode?: string;
  expandParent?: boolean;
  selected?: boolean;
}

export interface ConnectionData {
  type: 'execution' | 'data';
}

export interface NodeConnection {
  id: string;
  source: string;
  target: string;
  data?: ConnectionData;
}

export interface FileInfo {
  id: number | null;
  title: string;
  version: string;
  description: string | null;
  updatedAt: Date | number | null;
}

export interface EditorState {
  info: FileInfo;
  nodes: SDKNode[];
  connections: NodeConnection[];
}

export interface EditorContext extends EditorState {
  variables: SDKNode[];
  functions: SDKNode[];
  logics: SDKNode[];
}

export type CategoryKey = SDKNodeType;

export { default as functions } from './functions';
export { default as logics } from './logics';
export { default as variables } from './variables';
