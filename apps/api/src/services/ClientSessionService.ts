import type { Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "#api/config/env.ts";

async function createClientSession(userId: number) {
	const accessToken = jwt.sign({ userId }, env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});
	const refreshToken = jwt.sign({ userId }, env.REFRESH_TOKEN_SECRET, {
		expiresIn: "30d",
	});

	return { accessToken, refreshToken };
}

async function createClientCookie(
	res: Response,
	accessToken: string,
	refreshToken: string,
) {
	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 15 * 60 * 1000,
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 30 * 24 * 60 * 60 * 1000,
	});
}

export { createClientSession, createClientCookie };
