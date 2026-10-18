import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import log from "../helpers/console.ts";
import { fileURLToPath } from "node:url";
import { env } from "#api/config/env.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_TEMPLATES = path.join(path.resolve(__dirname, ".."), "templates");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

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

  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments: [
        {
          filename: "bitmap.png",
          content: fs.readFileSync(path.join(API_TEMPLATES, "bitmap.png")),
          cid: "unique@cid",
        },
      ],
    });

    log.success(`[EmailService] E-mail enviado para ${to} (id: ${info.messageId})`);
    return { success: true, id: info.messageId };

  } catch (error: any) {
    log.error(`[EmailService] Falha ao enviar e-mail para ${to}:`, error.message);
    throw new Error(error.message);
  }
}

export { sendEmailService };
