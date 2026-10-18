import {
	type BackendUserAuth,
	type DeviceData,
	mapUAResultToDeviceData,
} from "@projeto/types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import type { IResult } from "ua-parser-js";
import { UAParser } from "ua-parser-js";
import { env } from "#api/config/env.ts";
import { setUserDatabaseQuery } from "#api/helpers/query.ts";
import { Session, User } from "#api/models/index.ts";
import { createClientSession } from "./ClientSessionService.ts";

async function createUserSession(userId: number, deviceRaw: IResult) {
	const { accessToken, refreshToken } = await createClientSession(userId);
	const deviceData = mapUAResultToDeviceData(deviceRaw);

	await Session.create({
		accessToken,
		refreshToken,
		userId,
		deviceData,
	});

	return { accessToken, refreshToken };
}

async function updateUserSession(oldRefreshToken: string) {
	const storedToken = await Session.findOne({
		where: { refreshToken: oldRefreshToken },
		include: [{ model: User }],
	});

	if (!storedToken || !storedToken.User) {
		throw new Error("Refresh token não encontrado ou usuário inválido");
	}

	jwt.verify(oldRefreshToken, env.REFRESH_TOKEN_SECRET);

	const { accessToken, refreshToken } = await createClientSession(
		storedToken.User.id,
	);

	await Session.update(
		{ accessToken, refreshToken },
		{ where: { id: storedToken.id } },
	);

	return { accessToken, refreshToken };
}

async function verifyAndRenewSession({ accessToken }: Partial<BackendUserAuth>) {
	if (!accessToken) return null;

	try {
		jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);
	} catch {
		return null;
	}

	const session = await Session.findOne({
		where: { accessToken },
		include: [{ model: User }],
	});

	if (!session?.User) return null;

	return { user: session.User };
}

async function logoutAllSessions(userId: number, accessToken: string) {
	await Session.destroy({
		where: {
			userId,
			accessToken: { [Op.ne]: accessToken },
		},
	});
}

async function getAnyUserSession(userId: number) {
	if (!userId) throw new Error("Identificação do usuário não informada");
	const sessions = await Session.findAll({ where: { userId } });
	if (!sessions.length) throw new Error("Nenhuma sessão encontrada para o usuário");
	return sessions;
}

async function deleteUserSession(accessToken: string) {
	const deleted = await Session.destroy({ where: { accessToken } });
	if (!deleted) throw new Error("Sessão não encontrada");
}

async function getUserIDFromSessionToken(accessToken: string) {
	const session = await Session.findOne({
		where: { accessToken },
		attributes: ["userId"],
	});
	if (!session) throw new Error("Token inválido ou expirado");
	return session.userId;
}

async function handleLogin(login: string, password: string, userAgent?: string) {
	const parser = new UAParser(userAgent);
	const device: IResult = parser.getResult();

	const user = await User.scope("withPasswordHash").findOne({
		where: setUserDatabaseQuery({ value: login }),
	});
	if (!user) throw new Error("Usuário não encontrado.");

	const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
	if (!isPasswordValid) throw new Error("Senha inválida.");

	return createUserSession(user.id, device);
}

export {
	createUserSession,
	verifyAndRenewSession,
	logoutAllSessions,
	getAnyUserSession,
	deleteUserSession,
	handleLogin,
	getUserIDFromSessionToken,
	updateUserSession,
};
