// src/types/editor-config.ts
import type { ComputedRef } from 'vue'

// Define os tipos de input possíveis no seu editor
export type EditorParamType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'boolean'
  | 'checkbox'
  | 'resource-link'
  | 'complex-array'
  | 'file'

// Define a estrutura de um parâmetro (os campos do formulário)
export interface EditorParam {
  key: string
  label: string
  type: EditorParamType
  required?: boolean
  default?: any
  assetType?: 'image' | 'audio' | 'video' | 'document'
  options?: any[] | ComputedRef<any[]> // Pode ser array estático ou reativo da store
}

// Define a estrutura de uma funcionalidade (ex: "Mostrar Diálogo")
export interface EditorDefinition {
  text: string
  icon: string
  params: EditorParam[]
  execute: (params: Record<string, any>) => void | string
}

// Define a estrutura da Categoria (ex: "Ações", "Eventos")
export interface CategoryConfig<
  T extends Record<string, EditorDefinition> = Record<string, EditorDefinition>,
> {
  text: string
  icon: string
  definitions: T
}

// As chaves permitidas (Isso garante que você não digite 'action' sem o s por engano)
export type CategoryKey =
  | 'actions'
  | 'events'
  | 'conditions'
  | 'consequences'
  | 'objects'
  | 'quests'
  | 'skills'
  | 'assets'
  | 'nodes'

// O tipo do objeto de fallback
export interface FallbackItem {
  text: string
  icon?: string
}

// Definimos uma interface base para a definição
export interface EditorDefinition {
  text: string
  icon: string
  params: EditorParam[]
  execute: (params: Record<string, any>) => void | string
}

// Helper para criar definições sem perder a tipagem
// Isso funciona como o defineComponent do Vue
export function createDefinitions<T extends Record<string, EditorDefinition>>(defs: T) {
  return defs
}
