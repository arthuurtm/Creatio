import type { EditorState } from "@projeto/types";
import { projectPathGenerator } from "#api/helpers/query.ts";
import FileService from "./FileService";
import { validateProjectOwnership } from "./ProjectService";

interface BasicObjectData {
	id: number;
	version: string;
	accessToken: string;
}

interface SaveStateParams extends BasicObjectData {
	state: EditorState;
}

type GetStateParams = BasicObjectData;

async function saveState({ id, version, state, accessToken }: SaveStateParams) {
	await validateProjectOwnership(id, accessToken);
	const filepath = `${projectPathGenerator(String(id))}/editor.json`;
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
	await validateProjectOwnership(id, accessToken);
	const filepath = `${projectPathGenerator(String(id))}/editor.json`;
	return await FileService.read.readJson({
		bucket: "private",
		filepath,
	});
}

export default { saveState, getState };
