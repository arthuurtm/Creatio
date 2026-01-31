import fs from "node:fs";
import path from "node:path";
import { CodeChallengeMethod } from "google-auth-library";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import open from "open";
import log from "../helpers/console.ts";

const API_ROOT = path.join(process.cwd(), "api");
const API_CONFIG = path.join(API_ROOT, "config");
const API_TEMPLATES = path.join(API_ROOT, "templates");
const API_MAIL_CREDENTIAL = path.join(API_CONFIG, "credentials.json");
const API_LOCAL_MAIL_CREDENTIAL = path.join(
	API_CONFIG,
	"credentials.local.json",
);
let accessToken: string;
let refreshToken: string;
let codeVerifier: string;

const SCOPES = ["https://mail.google.com/"];
const credentials = JSON.parse(fs.readFileSync(API_MAIL_CREDENTIAL, "utf8"));
const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(
	client_id,
	client_secret,
	redirect_uris[0],
);

async function loadSavedCredentials() {
	if (!fs.existsSync(API_LOCAL_MAIL_CREDENTIAL)) return false;
	const tokens = JSON.parse(fs.readFileSync(API_LOCAL_MAIL_CREDENTIAL, "utf8"));
	oAuth2Client.setCredentials(tokens);
	try {
		const { token } = await oAuth2Client.getAccessToken();
		if (!token) throw new Error("Token inválido");
		accessToken = token;
		refreshToken = tokens.refresh_token || refreshToken;
		log.success("Serviço de email já autenticado!");
		return true;
	} catch (err) {
		log.error("RefreshToken expirado ou revogado");
		return false;
	}
}

// autenticar o serviço automaticamente
async function authenticateService() {
	const valid = await loadSavedCredentials();

	if (valid) {
		return {
			isAuth: true,
			url: null,
		};
	}

	const { codeVerifier: cv, codeChallenge } =
		await oAuth2Client.generateCodeVerifierAsync();

	codeVerifier = cv;

	const url = oAuth2Client.generateAuthUrl({
		access_type: "offline",
		scope: SCOPES,
		prompt: "consent",
		code_challenge: codeChallenge,
		code_challenge_method: CodeChallengeMethod.S256,
	});

	return {
		isAuth: false,
		url,
	};
}

// Passo 2 – trocar o "code" pelo token
async function handleOAuthCallback(code: string) {
	const { tokens } = await oAuth2Client.getToken({
		code,
		codeVerifier,
		redirect_uri: redirect_uris[0],
	});
	oAuth2Client.setCredentials(tokens);
	fs.writeFileSync(API_LOCAL_MAIL_CREDENTIAL, JSON.stringify(tokens));

	if (tokens.access_token) {
		accessToken = tokens.access_token;
		refreshToken = tokens.refresh_token || refreshToken;

		log.success("Credenciais do serviço de email salvas com sucesso!");
		return tokens;
	} else {
		throw new Error("Ocorreu um erro interno no servidor de email.");
	}
}

interface EmailParams {
	template: string;
	to: string;
	subject: string;
	[key: string]: any;
}

// Passo 3 – enviar email
async function sendEmailService({
	template,
	to,
	subject,
	...templateData
}: EmailParams) {
	if (!(await loadSavedCredentials()))
		throw new Error("Serviço não autenticado");

	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				type: "OAuth2",
				user: process.env.EMAIL_FROM,
				clientId: client_id,
				clientSecret: client_secret,
				refreshToken,
			},
		});

		const result = await transporter.sendMail({
			from: process.env.EMAIL_FROM,
			to,
			subject,
			html: loadTemplate(template, templateData),
			attachments: [
				{
					filename: "bitmap.png",
					path: path.join(API_TEMPLATES, "bitmap.png"),
					cid: "unique@cid",
				},
			],
		});

		return { success: true, message: "E-mail enviado", result };
	} catch (err) {
		log.error("Erro ao enviar email: ", err);
		throw err;
	}
}

function loadTemplate(name: string, variables: Record<string, any> = {}) {
	const filePath = path.join(API_TEMPLATES, `${name}.html`);
	if (!fs.existsSync(filePath)) {
		log.error("Caminho inválido: ", filePath);
		throw new Error();
	}

	let html = fs.readFileSync(filePath, "utf8");
	for (const key in variables) {
		html = html.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), variables[key]);
	}

	return html;
}

export {
	loadSavedCredentials,
	authenticateService,
	handleOAuthCallback,
	sendEmailService,
};
