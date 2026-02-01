import { gamePathGenerator } from "#api/helpers/query.ts";
import type { EditorState } from "@projeto/types";
import FileService from "./FileService";
import { validateGameOwnership } from "./GameService";

interface BasicObjectData {
	id: string;
	version: string;
	accessToken: string;
}

interface SaveStateParams extends BasicObjectData {
	state: EditorState;
}

type GetStateParams = BasicObjectData

async function saveState({ id, version, state, accessToken }: SaveStateParams) {
	await validateGameOwnership(id, accessToken);
	const filepath = `${gamePathGenerator(id, version)}/editor.json`;
	return await FileService.write.queueSave({
		bucket: "private",
		filepath,
		payload: state,
	});
}

/**
 * Recupera o estado do editor do storage.
 */
async function getState({ id, version, accessToken }: GetStateParams) {
	await validateGameOwnership(id, accessToken);
	const filepath = `${gamePathGenerator(id, version)}/editor.json`;
	return await FileService.read.readJson({
		bucket: "private",
		filepath,
	});
}

export default { saveState, getState };
