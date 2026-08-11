import type { EditorState } from "@projeto/types";
import { ASTTranspiler } from "@projeto/compiler";

interface CompileParams {
	state: EditorState;
}

interface CompileResult {
	success: boolean;
	code?: string;
	error?: string;
}

/**
 * Compila o estado do editor visual para código JavaScript.
 * Utiliza o ASTTranspiler do pacote @projeto/compiler.
 */
async function compileProjectState({
	state,
}: CompileParams): Promise<CompileResult> {
	try {
		const transpiler = new ASTTranspiler(state.nodes, state.connections);
		const code = transpiler.transpile();
		// TODO: Adicionar validação adicional do código gerado
		return { success: true, code };
	} catch (err) {
		return { success: false, error: (err as Error).message };
	}
}

export { compileProjectState };
export type { CompileResult, CompileParams };
