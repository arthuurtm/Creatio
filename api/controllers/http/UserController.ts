import type { NextFunction, Request, Response } from "express";
import { validateCodeAndGetUUID } from "#api/services/2FAService.ts";
import { createClientCookie } from "#api/services/ClientSessionService.ts";
import {
	getBasicUserData,
	resetUserPassword,
	setVerificationCodeAndSendEmail,
	signupUser,
} from "#api/services/UserService.ts";
import { handleLogin } from "#api/services/UserSessionService.ts";

async function getBasicUserDataController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { userId, identification } = req.query;
		if (!userId && !identification)
			throw new Error("Nenhum meio de identificação informado");
		const id = String(userId ?? identification);
		const data = await getBasicUserData(id);
		if (!data) return res.status(404).json({ error: "Usuário não encontrado" });
		res.json(data);
	} catch (err) {
		next(err);
	}
}

async function handleLoginController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const { type, identification, password, userAgent } = req.body;
	try {
		const { accessToken, refreshToken } = await handleLogin(
			type,
			identification,
			password,
			userAgent,
		);
		await createClientCookie(res, accessToken, refreshToken);
		res.send();
	} catch (err) {
		next(err);
	}
}

async function getUserDataController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		res.json(res.locals.user);
	} catch (err) {
		next(err);
	}
}

async function setSignupCodeController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { email } = req.body;
		const result = await setVerificationCodeAndSendEmail({
			email,
			template: "signupVerify",
			subject: "Verifique seu e-mail!",
			timeout: 0,
		});
		res.json({ expiresAt: result.expiresAt });
	} catch (err) {
		next(err);
	}
}

async function setResetPasswordCodeController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { email } = req.body;
		const result = await setVerificationCodeAndSendEmail({
			email,
			template: "resetPassword",
			subject: "Seu código para redefinir a senha",
			timeout: 0,
		});
		res.json({ expiresAt: result.expiresAt });
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

async function signupUserController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const user = await signupUser(req.body);
		res.status(201).json({ user });
	} catch (err) {
		next(err);
	}
}

async function resetUserPasswordController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { newPassword, accessUUID } = req.body;
		await resetUserPassword({ newPassword, accessToken: accessUUID });
		res.send();
	} catch (err) {
		next(err);
	}
}

export {
	getBasicUserDataController,
	signupUserController,
	setSignupCodeController,
	handleLoginController,
	getUserDataController,
	validateSecureSession,
	setResetPasswordCodeController,
	resetUserPasswordController,
};
