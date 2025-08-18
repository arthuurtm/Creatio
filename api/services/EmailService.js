import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import open from 'open';
import dotenv from 'dotenv';
dotenv.config();

let accessToken = null;
let refreshToken = null;
let codeVerifier = null;

const SCOPES = ['https://mail.google.com/'];

// Função para abrir o navegador e autenticar
export async function authenticateService() {
  const credentials = JSON.parse(fs.readFileSync(path.join(process.cwd(), './auth/credentials.json')));
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const { codeVerifier: cv, codeChallenge } = await oAuth2Client.generateCodeVerifierAsync();
  codeVerifier = cv;

  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  await open(url);
  return url;
}

// Função para enviar e-mail
export async function sendEmailService(variables) {
  if (!accessToken) throw new Error('Não autenticado');

  const html = fs.readFileSync(path.join(process.cwd(), 'templates', `${variables.structure_name}.html`), 'utf8');

  // substitui variáveis no template
  for (const key in variables) html.replace(`{{${key}}}`, variables[key]);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_FROM,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken,
      accessToken,
    },
  });

  const result = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: variables.to,
    subject: variables.subject,
    html,
  });

  return { success: true, message: 'E-mail enviado', result };
}
