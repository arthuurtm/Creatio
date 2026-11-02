// Tipos principais do editor — tudo vem do rete-studio-core
export type {
	InputType,
	JSONBaseNode,
	JSONBaseNode as SDKNode,
	JSONConnection,
	JSONConnection as NodeConnection,
	JSONControl,
	JSONEditorData,
	JSONInput,
	JSONOutput,
	Language,
	LanguageAdapter,
	LanguageSnippet,
	Schemes,
} from "rete-studio-core";
export {
	BaseNode,
	Connection,
	createAdapter,
	deserialize,
	serialize,
  applyInteraction
} from "rete-studio-core";
