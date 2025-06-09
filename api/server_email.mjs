/* eslint-disable no-undef */
import express from 'express'
import { google } from 'googleapis'
import nodemailer from 'nodemailer'
import open from 'open'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import bodyParser from 'body-parser'

dotenv.config({ path: '../.env' })

const app = express()
const port = 3001

app.use(bodyParser.json())

// ──────────────────
// 1. CREDENCIAIS
// ──────────────────
const CREDENTIALS_PATH = path.join(process.cwd(), './auth/credentials.json')
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH))
const { client_secret, client_id, redirect_uris } = credentials.web

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret, // OK mesmo com PKCE em cliente confidencial
  redirect_uris[0], // ex.: http://localhost:3001/oauth2callback
)

// ──────────────────
// 2. VARIÁVEIS GLOBAIS
// ──────────────────
let accessToken = null
let refreshToken = null
let codeVerifier = null // PKCE
const SCOPES = ['https://mail.google.com/']

// ──────────────────
// 3. FUNÇÃO util p/ templates
// ──────────────────
function loadTemplate(name, variables = {}) {
  try {
    const filePath = path.join(process.cwd(), 'templates', `${name}.html`)
    if (!fs.existsSync(filePath)) throw new Error(`Template '${name}' não encontrado.`)

    let html = fs.readFileSync(filePath, 'utf8')
    for (const key in variables)
      html = html.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), variables[key])

    return html
  } catch (err) {
    console.error(`Erro ao carregar template '${name}':`, err)
    throw new Error(`Template '${name}' não encontrado ou erro ao processar.`)
  }
}

// ──────────────────
// 4. /authenticate  → gera URL com PKCE e abre navegador
// ──────────────────
app.get('/authenticate', async (_req, res) => {
  // gera par verificador/desafio (biblioteca ≥ 8.0)
  const { codeVerifier: cv, codeChallenge } = await oAuth2Client.generateCodeVerifierAsync()
  codeVerifier = cv // guarda na memória (um único usuário)

  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  await open(url) // abre o navegador
  res.send('🔑 Navegador aberto – conclua o login na conta Google.')
})

// ──────────────────
// 5. /oauth2callback → troca o código por tokens usando o mesmo verifier
// ──────────────────
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code?.toString()
  if (!code) return res.status(400).send('Código ausente.')

  try {
    const { tokens } = await oAuth2Client.getToken({ code, codeVerifier })
    oAuth2Client.setCredentials(tokens)

    accessToken = tokens.access_token
    refreshToken = tokens.refresh_token ?? refreshToken // guarda se vier

    res.send('✅ Autenticado com sucesso! Pode fechar esta aba.')
  } catch (err) {
    console.error(err)
    res.status(500).send(`Erro ao autenticar: ${err}`)
  }
})

// ──────────────────
// 6. /send-email    → envia e-mail via Nodemailer + OAuth2
// ──────────────────
app.post('/send-email', async (req, res) => {
  const { variables } = req.body

  if (!accessToken) {
    return res.status(401).json({ message: 'Não autenticado. Acesse /authenticate primeiro.' })
  }

  try {
    const html = loadTemplate(variables.structure_name, variables)

    const tokenResult = await oAuth2Client.getAccessToken()
    accessToken = tokenResult.token

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
      to: variables.to,
      subject: variables.subject,
      html,
    })
    console.log('E-mail enviado:', result.response)
    res.json({ success: true, message: 'E-mail enviado com sucesso!' })
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err)
    res.status(500).json({ message: 'Erro ao enviar e-mail.', detail: err.message })
  }
})

// ──────────────────
// 7. INICIA SERVIDOR
// ──────────────────
app.listen(port, () => console.log(`🚀  http://localhost:${port}`))
