import type { NextFunction, Request, Response } from "express";
import { verifyAndRenewSession } from "#api/services/UserSessionService.ts";

async function isAuthenticated(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { accessToken } = req?.cookies || {};
		const result = await verifyAndRenewSession({ accessToken });

		if (!result || !result.user) {
			return res.status(401).json({ error: "Não autorizado" });
		}

		next();
	} catch (err) {
		next(err);
	}
}

export default isAuthenticated;
