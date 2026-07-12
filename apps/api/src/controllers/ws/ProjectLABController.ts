import type { EditorState, RouteContext } from "@projeto/types";
import EditorService from "#api/services/EditorService.ts";

export default {
	async updateJson({ ws, wss, payload }: RouteContext<EditorState>) {
		try {
			const projectState = payload;
			if (!projectState.info?.id) throw new Error("ID do jogo não fornecido");
			const accessToken = ws.cookies.accessToken;
			const objectName = await EditorService.saveState({
				id: projectState.info.id,
				version: projectState.info.version,
				state: projectState,
				accessToken,
			});
			ws.send(
				JSON.stringify({
					event: "project:lab:update:json:success",
					payload: { objectName },
				}),
			);
		} catch (err) {
			ws.send(
				JSON.stringify({
					event: "project:lab:update:json:error",
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
			const result = await EditorService.getState({
				id,
				version,
				accessToken,
			});
			ws.send(
				JSON.stringify({
					event: "project:lab:get:json:success",
					payload: result,
				}),
			);
		} catch (err) {
			ws.send(
				JSON.stringify({
					event: "project:lab:get:json:error",
					payload: { message: err.message },
				}),
			);
		}
	},
};
