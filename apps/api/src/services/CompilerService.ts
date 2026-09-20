import type { EditorState } from "@projeto/types";
import { ASTTranspiler, DiagnosticsAnalyzer } from "@projeto/compiler";
import type { Diagnostic } from "@projeto/compiler";

interface CompileParams {
	state: EditorState;
}

interface CompileResult {
	success: boolean;
	code?: string;
	error?: string;
	diagnostics?: Diagnostic[];
}

/**
 * Compila o estado do editor visual para código JavaScript.
 * Roda o DiagnosticsAnalyzer antes da geração de código.
 */
async function compileProjectState({
	state,
}: CompileParams): Promise<CompileResult> {
	try {
		// 1. Análise estática (diagnósticos)
		const analyzer = new DiagnosticsAnalyzer(state.nodes, state.connections);
		const diagnostics = analyzer.analyze();

		// 2. Geração de código
		const transpiler = new ASTTranspiler(state.nodes, state.connections);
		const code = transpiler.transpile();

		return { success: true, code, diagnostics };
	} catch (err) {
		return { success: false, error: (err as Error).message };
	}
}

export { compileProjectState };
export type { CompileResult, CompileParams };
