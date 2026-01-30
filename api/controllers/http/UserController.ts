import type { NextFunction, Request, Response } from "express";

import { createClientCookie } from "#api/services/ClientSessionService.ts";
import {
	getAllUserData,
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
		const { userId, login } = req.query;
		if (!userId && !login)
			throw new Error("Nenhum meio de identificação informado");
		const id = String(userId ?? login);
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
	const { login, password } = req.body;
	const userAgent = req.get("User-Agent") ?? "";

	try {
		const { accessToken, refreshToken } = await handleLogin(
			login,
			password,
			userAgent,
		);
		await createClientCookie(res, accessToken, refreshToken);
		res.json({ message: "Autorizado." });
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
		const data = await getAllUserData(req.cookies.accessToken);
		if (!data) res.status(401);
		res.status(200).json(data);
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
		});
		res.json({ expiresAt: result.expiresAt });
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
		const { nickname, username, email, birthdate, password, accessUUID } =
			req.body;
		const user = await signupUser({
			nickname,
			username,
			email,
			birthdate,
			password,
			accessUUID,
		});
		const { accessToken, refreshToken } = await handleLogin(username, password);
		await createClientCookie(res, accessToken, refreshToken);
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
		res.status(200).json({ message: "Senha redefinida com sucesso" });
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
	setResetPasswordCodeController,
	resetUserPasswordController,
};
