import {
	type BackendUserAuth,
	type DeviceData,
	mapUAResultToDeviceData,
} from "@projeto/types";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
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

	if (deviceData) {
		await Session.update(
			{
				deviceData,
			},
			{ where: { accessToken } },
		);
	}

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
		{
			accessToken: accessToken,
			refreshToken: refreshToken,
		},
		{ where: { id: storedToken.id } },
	);
	return { accessToken, refreshToken };
}

async function verifyAndRenewSession({ accessToken }: Partial<BackendUserAuth>) {
	if (!accessToken) return null;

	try {
		jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);
	} catch (err) {
		return null;
	}

	const session = await Session.findOne({
		where: { accessToken },
		include: [{ model: User }],
	});

	if (!session || !session.User) return null;

	return {
		user: session.User,
		newAccessToken: accessToken,
		newRefreshToken: "",
		renewNeeded: false,
	};
}

async function logoutAllSessions(userId: number, accessToken: string) {
	const sessions = await Session.findAll({
		where: {
			userId: userId,
			accessToken: { [Op.ne]: accessToken },
		},
	});

	await Promise.all(sessions.map((session) => session.destroy()));
}

async function getAnyUserSession(userId: number) {
	if (!userId) throw Error("Identificação do usuário da sessão não informado");
	const sessions = await Session.findAll({ where: { userId } });
	if (!sessions.length) {
		throw new Error("Nenhuma sessão encontrada para o usuário");
	}

	return sessions;
}

async function deleteUserSession(accessToken: string) {
	const session = await Session.findOne({ where: { accessToken } });

	if (!session) {
		throw new Error("Sessão não encontrada");
	}

	await session.destroy();
}

async function handleLogin(
	login: string,
	password: string,
	userAgent?: string,
) {
	const parser = new UAParser(userAgent);
	const device: IResult = parser.getResult();

	const user: User | null = await User.scope("withPasswordHash").findOne({
		where: setUserDatabaseQuery({ value: login }),
	});
	if (!user) throw new Error("Usuário não encontrado.");

	const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
	if (!isPasswordValid) throw new Error("Senha inválida.");

	const { accessToken, refreshToken } = await createUserSession(
		user.id,
		device,
	);
	return { accessToken, refreshToken };
}

async function getUserIDFromSessionToken(accessToken: string) {
	try {
		const res = await Session.findOne({
			where: { accessToken },
		});
		if (!res) throw new Error("Sessão não encontrada.");
		return res.userId;
	} catch (err) {
		throw new Error("Token inválido ou expirado");
	}
}

// lembrete: devo criar uma função que retorna o modelo de dados com base em accessToken
// para parar de injetar dados em res que não é tipado e é chato de mexer

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
