import type { NextFunction, Request, Response } from "express";
import { createClientCookie } from "#api/services/ClientSessionService.ts";
import { verifyAndRenewSession } from "#api/services/UserSessionService.ts";

async function isAuthenticated(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		let { accessToken, refreshToken } = req?.cookies || {};
		const { user, newAccessToken, newRefreshToken, renewNeeded } =
			(await verifyAndRenewSession({ accessToken, refreshToken })) || {};
		accessToken = newAccessToken || accessToken;
		refreshToken = newRefreshToken || refreshToken;

		if (!accessToken || !user) {
			return res.status(401).json({ error: "Não autorizado" });
		}

		if (renewNeeded) createClientCookie(res, accessToken, refreshToken);
		next();
	} catch (err) {
		next(err);
	}
}

export default isAuthenticated;
