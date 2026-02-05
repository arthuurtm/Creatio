import type { EditorState } from "@projeto/types";
import type { NextFunction, Request, Response } from "express";
import { getAnyGame, setGameOnDatabase } from "#api/services/GameService.ts";
import { getUserIDFromSessionToken } from "#api/services/UserSessionService.ts";

async function getAnyGameController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const filters = req.query;
		res.json(await getAnyGame(filters));
	} catch (err) {
		next(err);
	}
}

async function setGameOnDatabaseController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		if (!req.cookies.accessToken) throw new Error("Usuário não autenticado");
		const state: EditorState = req.body.state;
		const accessToken = req.cookies.accessToken;
		const userId = await getUserIDFromSessionToken(accessToken);
		const result = await setGameOnDatabase({
			title: state.info.title,
			description: state.info.description,
			userId,
			accessToken,
			state,
			version: state.info.version,
		});
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export { getAnyGameController, setGameOnDatabaseController };
