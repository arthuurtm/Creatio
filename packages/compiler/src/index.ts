import { createAdapter } from 'rete-studio-core';
import * as javascriptLang from 'rete-studio-javascript-lang';

/**
 * Instância do adapter do rete-studio para JavaScript.
 * Expõe as operações principais:
 *   - graphToCode(EditorState)  → string de código JS
 *   - codeToGraph(string)       → EditorState (nodes + connections)
 *   - codeToExecutable(string)  → string de código JS executável (purificado)
 *   - getSnippets()             → lista de snippets disponíveis
 */
export const jsAdapter = createAdapter(javascriptLang);

export type { LanguageAdapter, LanguageSnippet } from 'rete-studio-core';
