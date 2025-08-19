import { google } from 'googleapis'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import open from 'open'

let accessToken = null
let refreshToken = null
let codeVerifier = null

const SCOPES = ['https://mail.google.com/']

// Função para abrir o navegador e autenticar
async function authenticateService() {
  const credentials = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), './auth/credentials.json')),
  )
  const { client_secret, client_id, redirect_uris } = credentials.web
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

  const { codeVerifier: cv, codeChallenge } = await oAuth2Client.generateCodeVerifierAsync()
  codeVerifier = cv

  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  await open(url)
  return url
}

// Função para enviar e-mail
async function sendEmailService({ template, to, subject, ...templateData }) {
  if (!accessToken) throw new Error('Não autenticado')

  let html = template
  for (const key in templateData) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), templateData[key])
  }

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
  })

  const result = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: to,
    subject: subject,
    html,
  })

  return { success: true, message: 'E-mail enviado', result }
}

export { authenticateService, sendEmailService }
