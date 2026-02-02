import GameEditorService from "#api/services/EditorService.ts";
import type { EditorState } from "@projeto/types";
import type { RouteContext } from "@projeto/types";

export default {
	async updateJson({ ws, wss, payload }: RouteContext<EditorState>) {
		try {
			const gameState = payload;
			const { id, version } = gameState.info || {};
			if (!id) throw new Error("ID do jogo não fornecido");
			const accessToken = ws.cookies.accessToken;
			const objectName = await GameEditorService.saveState({
				id,
				version,
				state: gameState,
				accessToken,
			});
			ws.send(
				JSON.stringify({
					event: "game:lab:update:json:success",
					payload: { objectName },
				}),
			);
		} catch (err) {
			ws.send(
				JSON.stringify({
					event: "game:lab:update:json:error",
					payload: { message: err.message },
				}),
			);
		}
	},

	async getJson({ ws, wss, payload }: RouteContext<EditorState>) {
		try {
			const { id, version } = payload.info || {};
			if (!id) throw new Error("ID do jogo não fornecido");
			const accessToken = ws.cookies.accessToken;
			const result = await GameEditorService.getState({
				id,
				version,
				accessToken,
			});
			ws.send(
				JSON.stringify({
					event: "game:lab:get:json:success",
					payload: result,
				}),
			);
		} catch (err) {
			ws.send(
				JSON.stringify({
					event: "game:lab:get:json:error",
					payload: { message: err.message },
				}),
			);
		}
	},
};
