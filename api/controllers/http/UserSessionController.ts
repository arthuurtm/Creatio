import type { NextFunction, Request, Response } from "express";
import log from "#api/helpers/console.ts";
import {
	getAnyUserSession,
	getUserIDFromSessionToken,
	logoutAllSessions,
} from "#api/services/UserSessionService.ts";

async function logoutAllSessionsController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const accessToken = req.cookies.accessToken;
		const userId = await getUserIDFromSessionToken(accessToken);
		res.send(await logoutAllSessions(userId, accessToken));
	} catch (err) {
		next(err);
	}
}

async function getAnyUserSessionController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const accessToken = req.cookies.accessToken;
		const userId = await getUserIDFromSessionToken(accessToken);
		const result = await getAnyUserSession(userId);
		res.json(result);
	} catch (err) {
		next(err);
	}
}

async function logoutUserController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.json({ message: "Usuário deslogado com sucesso" });
	} catch (err) {
		next(err);
	}
}

export {
	logoutAllSessionsController,
	getAnyUserSessionController,
	logoutUserController,
};
