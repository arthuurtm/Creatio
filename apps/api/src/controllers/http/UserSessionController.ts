import type { NextFunction, Request, Response } from "express";
import log from "#api/helpers/console.ts";
import { validateCodeAndGetUUID } from "#api/services/2FAService.ts";
import {
	getAnyUserSession,
	getUserIDFromSessionToken,
	logoutAllSessions,
} from "#api/services/UserSessionService.ts";
import { Session } from "#api/models/index.ts";

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

async function validateSecureSession(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { secureToken: token, tokenId: id } = req.body;
		const { valid, uuid } = await validateCodeAndGetUUID(id, token);
		if (!valid) {
			throw new Error("Código inválido ou expirado");
		}

		res.status(200).json({ accessUUID: uuid });
	} catch (err) {
		next(err);
	}
}

async function deleteSessionController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const accessToken = req.cookies.accessToken;
		const userId = await getUserIDFromSessionToken(accessToken);
		const { sessionId } = req.body;
		if (!sessionId) throw new Error("ID da sessão não fornecido");

		const session = await Session.findOne({ where: { id: sessionId, userId } });
		if (!session) throw new Error("Sessão não encontrada");

		await session.destroy();
		res.json({ message: "Sessão revogada com sucesso" });
	} catch (err) {
		next(err);
	}
}

export {
	logoutAllSessionsController,
	getAnyUserSessionController,
	logoutUserController,
	validateSecureSession,
	deleteSessionController,
};
