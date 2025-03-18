/* eslint-disable no-undef */
const express = require('express')
const { Sequelize, DataTypes } = require('sequelize')
const cors = require('cors')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')
const cookieParser = require('cookie-parser')
const UAParser = require('ua-parser-js')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const https = require('https')
const validator = require('validator')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
require('dotenv').config({ path: '../.env' })

const httpsOptions = {
  key: fs.readFileSync('./auth/certificate/auto/key.pem'),
  cert: fs.readFileSync('./auth/certificate/auto/cert.pem'),
}

const corsOptions = {
  origin: ['http://localhost:5173'],
  credentials: true,
}
const app = express()
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: 'localhost',
    dialect: 'mariadb',
  },
)

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      collate: 'utf8mb4_unicode_ci',
    },
    birthdate: { type: DataTypes.DATEONLY, allowNull: false },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    nickname: { type: DataTypes.STRING, allowNull: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    gToken: { type: DataTypes.STRING, unique: true, allowNull: true },
    profilePic: { type: DataTypes.TEXT, allowNull: true }, // Para URLs longas
  },
  { timestamps: true },
)

const Session = sequelize.define(
  'Session',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    accessToken: { type: DataTypes.STRING, allowNull: false },
    refreshToken: { type: DataTypes.STRING, allowNull: false },
    deviceOS: { type: DataTypes.STRING },
    deviceNavigator: { type: DataTypes.STRING },
    deviceGenerics: { type: DataTypes.JSON },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  { timestamps: true },
)

const Game = sequelize.define(
  'Game',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    genre: { type: DataTypes.STRING },
    releaseDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  { timestamps: true },
)

const EmailCodeVerify = sequelize.define(
  'EmailCodeVerify',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: User, key: 'id' },
      onDelete: 'CASCADE',
    },
    type: { type: DataTypes.INTEGER, allowNull: false },
    token: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  },
  { timestamps: false },
)

// Definição de Relacionamentos
User.hasMany(EmailCodeVerify, { foreignKey: 'userId', onDelete: 'CASCADE' })
EmailCodeVerify.belongsTo(User, { foreignKey: 'userId' })

User.hasMany(Session, { foreignKey: 'userId', onDelete: 'CASCADE' })
Session.belongsTo(User, { foreignKey: 'userId' })

User.hasMany(Game, { foreignKey: 'userId', onDelete: 'CASCADE' })
Game.belongsTo(User, { foreignKey: 'userId' })

sequelize.sync()

function generateRandomNumbers() {
  let numbers = ''
  for (let i = 0; i < 6; i++) {
    numbers += crypto.randomInt(0, 10)
  }
  return numbers
}

async function sendEmail(type, data = {}) {
  try {
    let bodyContent = {}

    // Recuperar senha da conta
    if (type === 'resetPassSendCode') {
      await EmailCodeVerify.create({
        userId: data.userId,
        type: 1,
        token: data.verificationCode,
        expiresAt: data.expiresAt,
      })
      bodyContent = {
        variables: {
          structure_name: 'resetPassword',
          username: data.nickname,
          to: data.email,
          subject: 'Seu código para redefinir a senha',
          verificationCode: data.verificationCode,
        },
      }

    // Código de verificação do cadastro
    } else if (type === 'signupSendCode') {
      await EmailCodeVerify.create({
        type: 2,
        token: data.verificationCode,
        expiresAt: data.expiresAt,
      })
      bodyContent = {
        variables: {
          structure_name: 'signupVerifyEmail',
          to: data.email,
          subject: 'Verifique seu e-mail',
          verificationCode: data.verificationCode,
        },
      }

    // E-mail de confirmação que a senha foi enviada
    } else if (type === 'resetedPassword') {
      bodyContent = {
        variables: {
          structure_name: 'resetedPassword',
          to: data.email,
          username: data.nickname,
          subject: 'Senha alterada com sucesso',
        },
      }
    }

    const response = await fetch('http://localhost:3001/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyContent),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Erro ao processar função sendMail: ', errorData.message)
      return false
    } else {
      return true
    }
  } catch (error) {
    console.error('Erro ao processar função sendEmail: ', error)
    return false
  }
}

async function createUserSession(userId, deviceData) {
  try {
    const accessToken = jwt.sign(
      { userId },
      process.env.ACCESS_SECRET,
      { expiresIn: '15m' }, // Expira em 15 minutos
    )

    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_SECRET,
      { expiresIn: '30d' }, // Expira em 30 dias
    )

    await Session.create({
      accessToken: accessToken,
      refreshToken: refreshToken,
      userId: userId,
      createdAt: new Date(),
    })

    if (deviceData) {
      await Session.update(
        {
          deviceOS: deviceData.os.name,
          deviceNavigator: deviceData.browser.name,
          deviceGenerics: deviceData,
        },
        { where: { accessToken } },
      )
    }

    return { accessToken, refreshToken }
  } catch (error) {
    console.error('Erro ao processar função createUserSession: ', error)
    return { accessToken: null, refreshToken: null }
  }
}

async function updateUserSession(userId, oldRefreshToken) {
  try {
    const accessToken = jwt.sign(
      { userId },
      process.env.ACCESS_SECRET,
      { expiresIn: '15m' }, // Expira em 15 minutos
    )

    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_SECRET,
      { expiresIn: '30d' }, // Expira em 30 dias
    )

    await Session.update(
      {
        accessToken: accessToken,
        refreshToken: refreshToken,
        updatedAt: new Date(),
      },
      { where: { refreshToken: oldRefreshToken, userId } },
    )

    return { accessToken, refreshToken }
  } catch (error) {
    console.error('Erro ao processar função createUserSession: ', error)
    return { accessToken: null, refreshToken: null }
  }
}

function checkIfUserIsValid(input) {
  try {
    const isEmail = validator.isEmail(input)
    const query = isEmail ? { email: input } : { username: input }
    return query
  } catch (error) {
    console.error('Erro ao processar função checkIfUserIsValid: ', error)
    return false
  }
}

// Efetua o login do usuário
app.post('/getLogin', async (req, res) => {
  const { type, email, password } = req.body
  const userAgent = req.headers['user-agent']
  const parser = new UAParser()
  const device = parser.setUA(userAgent).getResult()
  // const isMobile = req.headers['sec-ch-ua-mobile'] === '?1';

  try {
    let user = null

    if (type === 'default') {
      user = await User.findOne({ where: { email } })
      if (!user) return res.status(400).json({ message: 'Usuário não encontrado' })

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
      if (!isPasswordValid) return res.status(400).json({ message: 'Senha incorreta' })
    } else if (type === 'google') {
      user = await User.findOne({ where: { email } })
      if (!user)
        return res.status(400).json({ message: 'Conta Google não vinculada a nenhuma conta.' })
    } else {
      return res.status(400).json({ message: 'Solicitação incorreta.' })
    }

    const { accessToken, refreshToken } = await createUserSession(user.id, device)

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000, // 15 minutos
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    })

    res.status(200).json({ message: 'Login bem-sucedido!' })
  } catch (error) {
    console.error('Erro ao processar solicitação de getLogin:', error)
    res.status(500).json({ message: 'Erro interno no servidor' })
  }
})

// Gerar novo accessToken
app.post('/refreshToken', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token ausente' })

  try {
    // Busca do refresh token no banco
    const storedToken = await Session.findOne({ where: { refreshToken } }) // Corrigido aqui
    if (!storedToken)
      return res.status(404).json({ message: 'Refresh token não encontrado na base de dados' })

    // Verificando e decodificando o refresh token
    jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Refresh token inválido' })

      const { accessToken, refreshToken: newRefreshToken } = await updateUserSession(
        decoded.userId,
        refreshToken,
      ) // Garantir que a função seja assíncrona

      // Verificando se os tokens foram gerados corretamente
      if (!accessToken || !newRefreshToken) {
        return res.status(500).json({ message: 'Erro ao gerar tokens' })
      }

      // Enviar os novos tokens como cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000, // 15 minutos
      })

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
      })

      res.json({ message: 'Tokens renovados' })
    })
  } catch (error) {
    console.log('Erro ao processar solicitação de refreshToken: ', error)
    res.status(500).json({ message: 'Erro interno no servidor' })
  }
})

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
  res.status(200).json({ message: 'Usuário deslogado com sucesso' })
})

// Buscar dados básicos do usuário
app.post('/getUserBasics', async (req, res) => {
  const accessToken = req.cookies?.accessToken
  const { userId, username } = req.body

  if (!userId && !accessToken && !username) {
    return res
      .status(400)
      .json({ message: 'Solicitação inválida: forneça um ID ou sessão/nome do usuário.' })
  }

  try {
    let user = null

    if (accessToken) {
      const session = await Session.findOne({
        where: { accessToken },
        include: [{ model: User }],
      })
      user = session ? session.User : null
    } else if (userId) {
      user = await User.findOne({ where: { id: userId } })
    } else if (username) {
      user = await User.findOne({ where: { username: username } })
    }

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })

    res.status(200).json({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      profilePic: user.profilePic,
      // gToken: user.gToken,
      exists: true,
    })
  } catch (error) {
    console.error('Erro ao processar getBasicUserData:', error)
    res.status(500).json({ message: 'Erro interno no servidor' })
  }
})

// Verificar se a sessão é válida
app.post('/getUserSession', async (req, res) => {
  try {
    const accessToken = req.cookies?.accessToken
    const refreshToken = req.cookies?.refreshToken

    if (!accessToken) {
      return res.status(401).json({ message: 'Token de acesso não informado.' })
    }

    let decoded
    try {
      decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET)
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido ou expirado.' })
    }

    // Busca o usuário
    console.log('userId: ', decoded.userId)
    const user = await User.findByPk(decoded.userId)
    if (!user) return res.status(401).json({ message: 'Usuário não encontrado.' })

    res.status(200).json({ message: 'Sessão válida.' })
  } catch (error) {
    console.error('Erro ao verificar sessão:', error)
    res.status(500).json({ message: 'Erro interno do servidor.' })
  }
})

// Gerar e enviar código de verificação no e-mail para criação da conta
app.post('/setSignupCode', async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ where: { email } })
    if (user) {
      return res.status(400).json({ message: 'Este e-mail já foi usado.', errCode: 'emailInUse' })
    }

    const data = {
      email: email,
      verificationCode: generateRandomNumbers(),
      expiresAt: new Date(Date.now() + 3600000),
    }
    const emailSent = await sendEmail('signupSendCode', data)

    if (emailSent) {
      return res.status(200).json({ message: 'E-mail enviado com sucesso.' })
    } else {
      return res.status(500).json({ message: 'Erro ao enviar e-mail.', errCode: 'emailSendError' })
    }
  } catch (error) {
    console.error('Erro ao processar solicitação de setSignupCode:', error)
    return res.status(500).json({ message: 'Erro interno do servidor.', error: error.message })
  }
})

// Cadastrar novo usuário no Banco de Dados
app.post('/setUser', async (req, res) => {
  try {
    const { nickname, username, email, birthdate, password, verificationCode } = req.body

    const currentDate = new Date()
    const birthDateObj = new Date(birthdate)
    if (isNaN(birthDateObj.getTime()) > currentDate) {
      return res
        .status(400)
        .json({ message: 'A data de nascimento deve ser válida.', errCode: 'invalidDatebirth' })
    }

    const [verifyEntry, usernameExists] = await Promise.all([
      EmailCodeVerify.findOne({ where: { type: 2, token: verificationCode } }),
      User.findOne({ where: { username } }),
    ])

    if (!verifyEntry) {
      return res
        .status(400)
        .json({ message: 'Código de verificação inválido.', errCode: 'invalidCode' })
    } else if (new Date() > verifyEntry.expiresAt) {
      return res
        .status(400)
        .json({ message: 'Código de verificação expirado.', errCode: 'invalidCode' })
    }

    if (usernameExists) {
      return res
        .status(400)
        .json({ message: 'Nome de usuário já usado.', errCode: 'usernameExists' })
    }

    const [passwordHash, sessionToken] = await Promise.all([bcrypt.hash(password, 10), uuidv4()])

    const user = await User.create({
      nickname,
      username,
      email,
      birthdate,
      passwordHash,
      sessionToken,
    })

    return res.status(201).json({ message: 'Usuário criado com sucesso', user })
  } catch (error) {
    console.error('Erro ao processar solicitação de setUser:', error)
    return res.status(500).json({ message: 'Erro ao criar o usuário', errCode: 'internalError' })
  }
})

// Lista todas as sessões de um usuário
app.post('/getAllUserSessions', async (req, res) => {
  const { userId } = req.body

  try {
    const sessions = await Session.findAll({ where: { userId } })

    if (!sessions.length) {
      return res.status(404).json({ message: 'Nenhuma sessão encontrada.' })
    }

    res.status(200).json(sessions)
  } catch (error) {
    console.error('Erro ao listar sessões:', error)
    res.status(500).json({ message: 'Erro interno do servidor.' })
  }
})

// Deleta uma sessão específica, desconectando a mesma
app.post('/deleteSession', async (req, res) => {
  const { sessionId } = req.body

  try {
    const session = await Session.findOne({ where: { sessionId } })

    if (!session) {
      return res.status(404).json({ message: 'Sessão não encontrada.' })
    }

    await session.destroy()
    res.status(200).json({ message: 'Sessão deletada com sucesso.' })
  } catch (error) {
    console.error('Erro ao deletar sessão:', error)
    res.status(500).json({ message: 'Erro interno no servidor.' })
  }
})

// Retornar todos os jogos disponíveis no site
app.get('/getGames', async (req, res) => {
  try {
    const games = await Game.findAll()
    if (games.length === 0) return res.status(404).json({ message: 'Nenhum jogo encontrado' })
    res.status(200).json(games)
  } catch (error) {
    console.error('Erro ao processar solicitação de getGames: ', error)
    res.status(500).json({ message: 'Erro interno no servidor' })
  }
})

// Gera um código de verificação e envia um e-mail para resetar a senha
app.post('/setResetPassCode', async (req, res) => {
  const { userId } = req.body

  try {
    const user = await User.findOne({ where: { id: userId } })
    const data = {
      email: user.email,
      userId: user.id,
      nickname: user.nickname,
      verificationCode: generateRandomNumbers(),
      expiresAt: new Date(Date.now() + 3600000),
    }

    const emailSent = await sendEmail('resetPassSendCode', data)
    if (emailSent) {
      return res
        .status(200)
        .json({ message: 'Código de redefinição gerado e e-mail enviado com sucesso' })
    } else {
      return res.status(500).json({ message: 'Erro ao enviar e-mail', errCode: 'emailSendError' })
    }
  } catch (error) {
    console.error('Erro ao processar solicitação de setResetPassCode: ', error)
    res.status(500).json({ message: 'Erro interno no servidor' })
  }
})

// Recupera ao código e verifica se é válido
app.post('/getResetPassCode', async (req, res) => {
  const { userId, resetToken } = req.body

  try {
    const resetEntry = await EmailCodeVerify.findOne({
      where: { userId, type: 1, token: resetToken },
    })

    if (!resetEntry || new Date() > resetEntry.expiresAt) {
      return res.status(400).json({ message: 'Código inválido ou expirado.' })
    }

    res.status(200).json({ message: 'Código válido.' })
  } catch (error) {
    console.error('Erro ao processar solicitação de getResetPassCode: ', error)
    res.status(500).json({ message: 'Erro interno no servidor.' })
  }
})

// Define a nova senha do usuário
app.post('/setUserPassword', async (req, res) => {
  const { userId, resetToken, newPassword } = req.body

  try {
    const resetEntry = await EmailCodeVerify.findOne({
      where: { userId, type: 1, token: resetToken },
    })

    if (!resetEntry || new Date() > resetEntry.expiresAt) {
      return res.status(400).json({ message: 'Código inválido ou expirado.' })
    }

    // Atualizar a senha do usuário
    const user = await User.findOne({ where: { id: userId } })
    const passwordHash = await bcrypt.hash(newPassword, 10)
    const sessionToken = crypto.randomBytes(32).toString('hex')
    user.passwordHash = passwordHash
    user.sessionToken = sessionToken
    await user.save()

    // Excluir o token usado
    await resetEntry.destroy()

    const data = {
      email: user.email,
      nickname: user.nickname,
    }

    await sendEmail('resetedPassword', data)

    res.status(200).json({ message: 'Senha redefinida com sucesso!' })
  } catch (error) {
    console.error('Erro ao processar solicitação de setUserPassword: ', error)
    res.status(500).json({ message: 'Erro interno no servidor.' })
  }
})

// Autentica o usuário com a conta do Discord
app.post('/setDiscord', async (req, res) => {
  const { code } = req.body

  try {
    const params = new URLSearchParams({
      client_id: process.env.VITE_DISCORD_CLIENT_ID,
      client_secret: process.env.VITE_DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:5173/account/connect/discord',
      scope: 'identify email',
    })

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })

    const tokenData = await tokenRes.json()
    console.log(tokenData)
    if (!tokenRes.ok) {
      return res.status(400).json({ message: tokenData })
    }

    const userRes = await fetch('https://discord.com/api/users/@me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const userData = await userRes.json()
    console.log(userData)
    res.json(userData)
  } catch (error) {
    console.error('Erro ao processar solicitação de setDiscord: ', error)
    res.status(500).json({ message: 'Erro ao autenticar com o Discord' })
  }
})

const port = 3000
app.listen(port, () => {
  console.log('.::: DATABASE BACKEND :::.')
  console.log(`Servidor rodando na porta ${port}\n`)
})
// https.createServer(httpsOptions, app).listen(port, () => {
//   console.log('.::: DATABASE BACKEND :::.');
//   console.log(`Servidor rodando na porta ${port}\n`)
// });
