import type { EditorState } from "@projeto/types";
import { unref } from "vue";

/**
 * Helper para obter o timestamp.
 */
const getTimestamp = (obj: EditorState) => obj.info?.updatedAt || Date.now();

export function useSyncProtection(localState: any) {
	/**
	 * Compara a versão do arquivo local com a remota.
	 * Agora compara apenas o timestamp da RAIZ.
	 * * @param {object} remoteState O objeto completo recebido do servidor.
	 */
	const isLocalStateNewer = (remoteState: any): boolean => {
		const currentState = unref(localState);

		// Pega o timestamp da raiz do objeto
		const localTs = getTimestamp(currentState);
		const remoteTs = getTimestamp(remoteState);

		if (localTs > remoteTs) {
			console.warn(
				`Proteção de Sincronia: O estado local (${localTs}) é mais recente que o servidor (${remoteTs}). Sobrescrita bloqueada.`,
			);
			return true;
		}

		return false;
	};

	return {
		isLocalStateNewer,
	};
}
