import fs from "node:fs";
import path from "node:path";
import { Resend } from "resend";
import log from "../helpers/console.ts";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_TEMPLATES = path.join(path.resolve(__dirname, ".."), "templates");

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailParams {
	template: string;
	to: string;
	subject: string;
	[key: string]: any;
}

function loadTemplate(name: string, variables: Record<string, any> = {}) {
	const filePath = path.join(API_TEMPLATES, `${name}.html`);
	if (!fs.existsSync(filePath)) {
		log.error("Template não encontrado: ", filePath);
		throw new Error(`Template de e-mail '${name}' não encontrado.`);
	}
	let html = fs.readFileSync(filePath, "utf8");
	for (const key in variables) {
		html = html.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), variables[key]);
	}
	return html;
}

async function sendEmailService({ template, to, subject, ...templateData }: EmailParams) {
	const html = loadTemplate(template, templateData);

	const { data, error } = await resend.emails.send({
		from: process.env.EMAIL_FROM,
		to,
		subject,
		html,
    attachments: [
			{
				filename: "bitmap.png",
				content: fs.readFileSync(path.join(API_TEMPLATES, "bitmap.png")),
			},
		],
	});

	if (error) {
		log.error(`[EmailService] Falha ao enviar e-mail para ${to}:`, error.message);
		throw new Error(error.message);
	}

	log.success(`[EmailService] E-mail enviado para ${to} (id: ${data?.id})`);
	return { success: true, id: data?.id };
}

export { sendEmailService };
