import { google } from 'googleapis'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import open from 'open'
import log from '../helpers/console.js'

let accessToken = null
let refreshToken = null
let codeVerifier = null

const SCOPES = ['https://mail.google.com/']
const credentials = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), './config/credentials.json')),
)

const { client_secret, client_id, redirect_uris } = credentials.web
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

// Passo 1 – gerar URL e abrir no navegador
async function authenticateService() {
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

// Passo 2 – trocar o "code" pelo token
async function handleOAuthCallback(code) {
  const { tokens } = await oAuth2Client.getToken({
    code,
    codeVerifier,
    redirect_uri: redirect_uris[0],
  })

  oAuth2Client.setCredentials(tokens)

  accessToken = tokens.access_token
  refreshToken = tokens.refresh_token || refreshToken // pode vir só na primeira vez

  console.log('Tokens salvos com sucesso!')
  return tokens
}

// Passo 3 – enviar email
async function sendEmailService({ template, to, subject, ...templateData }) {
  if (!accessToken) throw new Error()

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_FROM,
      clientId: client_id,
      clientSecret: client_secret,
      refreshToken,
      accessToken,
    },
  })

  const result = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: loadTemplate(template, templateData),
    attachments: [
      {
        filename: 'bitmap.png',
        path: path.join(process.cwd(), 'templates', 'bitmap.png'),
        cid: 'unique@cid',
      },
    ],
  })

  return { success: true, message: 'E-mail enviado', result }
}

function loadTemplate(name, variables = {}) {
  const filePath = path.join(process.cwd(), 'templates', `${name}.html`)
  if (!fs.existsSync(filePath)) {
    log.error('Caminho inválido: ', filePath)
    throw new Error()
  }

  let html = fs.readFileSync(filePath, 'utf8')
  for (const key in variables) {
    html = html.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), variables[key])
  }

  return html
}

export { authenticateService, handleOAuthCallback, sendEmailService }
