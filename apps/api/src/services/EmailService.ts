import fs from "node:fs";
import path from "node:path";
import { CodeChallengeMethod } from "google-auth-library";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import log from "../helpers/console.ts";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_ROOT = path.resolve(__dirname, "..");
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
		const tokenPromise = oAuth2Client.getAccessToken();
		const timeoutPromise = new Promise((_, reject) =>
			setTimeout(() => reject(new Error("Timeout ao conectar ao servidor de autenticação")), 5000)
		);
		const res = (await Promise.race([tokenPromise, timeoutPromise])) as any;
		const token = typeof res === "string" ? res : res?.token;
		if (!token) throw new Error("Token inválido");
		accessToken = token;
		refreshToken = tokens.refresh_token || refreshToken;
		log.success("Serviço de email já autenticado!");
		return true;
	} catch (err: any) {
		log.error("Erro ao verificar credenciais do serviço de e-mail:", err?.message || err);
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

interface QueuedEmail {
	id: string;
	params: EmailParams;
	attempts: number;
	createdAt: Date;
}

const emailQueue: QueuedEmail[] = [];
let isQueueProcessing = false;
let retryWorkerTimer: NodeJS.Timeout | null = null;

// Envio direto do e-mail sem enfileirar
async function sendEmailDirect({
	template,
	to,
	subject,
	...templateData
}: EmailParams) {
	const isAuth = await loadSavedCredentials();
	if (!isAuth) {
		throw new Error("Serviço de e-mail não autenticado ou sem conexão com a internet.");
	}

	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			type: "OAuth2",
			user: process.env.EMAIL_FROM,
			clientId: client_id,
			clientSecret: client_secret,
			refreshToken,
		},
		connectionTimeout: 5000,
		greetingTimeout: 5000,
		socketTimeout: 10000,
	} as any);

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

	return result;
}

// Processador da fila de e-mails em segundo plano
async function processEmailQueue() {
	if (isQueueProcessing || emailQueue.length === 0) return;
	isQueueProcessing = true;

	log.info(`[Email Queue Worker] Processando ${emailQueue.length} e-mail(s) pendente(s)...`);

	for (let i = emailQueue.length - 1; i >= 0; i--) {
		const item = emailQueue[i];
		try {
			await sendEmailDirect(item.params);
			log.success(`[Email Queue Worker] E-mail enviado com sucesso para ${item.params.to}!`);
			emailQueue.splice(i, 1);
		} catch (err: any) {
			item.attempts++;
			log.warn(
				`[Email Queue Worker] Falha no envio para ${item.params.to} (tentativa ${item.attempts}): ${err?.message || err}. Nova tentativa em 15s...`
			);
		}
	}

	isQueueProcessing = false;
}

// Inicia o worker de re-tentativas (roda a cada 15 segundos)
function startRetryWorker() {
	if (retryWorkerTimer) return;
	retryWorkerTimer = setInterval(() => {
		if (emailQueue.length > 0) {
			processEmailQueue();
		} else if (!accessToken) {
			loadSavedCredentials();
		}
	}, 15000);
}

// Inicializa o worker imediatamente
startRetryWorker();

// Passo 3 – enviar email (com re-tentativa automatica se falhar)
async function sendEmailService(params: EmailParams) {
	try {
		const result = await sendEmailDirect(params);
		return { success: true, message: "E-mail enviado", result };
	} catch (err: any) {
		log.warn(
			`Não foi possível enviar e-mail imediatamente para ${params.to}: ${err?.message || err}. Adicionado à fila de re-tentativas.`
		);
		emailQueue.push({
			id: Math.random().toString(36).substring(2, 9),
			params,
			attempts: 1,
			createdAt: new Date(),
		});
		processEmailQueue();
		return { success: false, message: "E-mail adicionado à fila para re-tentativa", queued: true };
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
