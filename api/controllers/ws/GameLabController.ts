import GameEditorService from "#api/services/EditorService.ts";
import type { EditorState } from "#types/domain/editor/index.ts";
import type { RouteContext } from "#types/shared/websocket.ts";

export default {
	async updateJson({ ws, wss, data }: RouteContext<EditorState>) {
		try {
			const gameState = data;
			const { id, version } = gameState.info || {};
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
					data: { objectName },
				}),
			);
		} catch (err) {
			ws.send(
				JSON.stringify({
					event: "game:lab:update:json:error",
					data: { message: err.message },
				}),
			);
		}
	},

	async getJson({ ws, wss, data }: RouteContext<EditorState>) {
		try {
			const { id, version } = data.info || {};
			const accessToken = ws.cookies.accessToken;
			const result = await GameEditorService.getState({
				id,
				version,
				accessToken,
			});
			ws.send(
				JSON.stringify({
					event: "game:lab:get:json:success",
					data: result,
				}),
			);
		} catch (err) {
			ws.send(
				JSON.stringify({
					event: "game:lab:get:json:error",
					data: { message: err.message },
				}),
			);
		}
	},
};
