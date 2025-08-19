import jwt from 'jsonwebtoken'
import { User, Session } from '../models/index.js'
import { createClientSession, createClientCookie } from './ClientSessionService.js'
import { Op } from 'sequelize'
import { setUserDatabaseQuery } from '../helpers/query.js'
import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import { UAParser } from 'ua-parser-js'

async function createUserSession(userId, deviceData) {
  const { accessToken, refreshToken } = createClientSession(userId, deviceData)

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
}

async function updateUserSession(oldRefreshToken) {
  const storedToken = await Session.findOne({
    where: { refreshToken: oldRefreshToken },
    include: [{ model: User }],
  })

  if (!storedToken || !storedToken.User) {
    throw new Error('Refresh token não encontrado ou usuário inválido')
  }

  jwt.verify(oldRefreshToken, process.env.REFRESH_SECRET)

  const { accessToken, refreshToken } = createClientSession(
    storedToken.User.id,
    storedToken.deviceGenerics,
  )

  await Session.update(
    {
      accessToken: accessToken,
      refreshToken: refreshToken,
      updatedAt: new Date(),
    },
    { where: { id: storedToken.id } },
  )
  return { accessToken, refreshToken }
}

async function verifyAndRenewSession(req, res) {
  let { accessToken, refreshToken } = req.cookies

  if (!accessToken) {
    if (!refreshToken) {
      return null
    }

    const tokens = await updateUserSession(refreshToken)
    accessToken = tokens.accessToken
    refreshToken = tokens.refreshToken

    if (!accessToken || !refreshToken) {
      return null
    }

    createClientCookie(res, accessToken, refreshToken)
  }

  const session = await Session.findOne({ where: { accessToken }, include: [{ model: User }] })
  const user = session ? session.User : null

  return { user, accessToken, refreshToken }
}

async function logoutAllSessions(userId, accessToken) {
  const sessions = await Session.findAll({
    where: {
      userId: userId,
      accessToken: { [Op.ne]: accessToken },
    },
  })

  await Promise.all(sessions.map((session) => session.destroy()))
}

async function getAnyUserSession(userId) {
  userId = setUserDatabaseQuery(userId)

  const sessions = await Session.findAll({ where: { userId } })
  if (!sessions.length) {
    throw new Error('Nenhuma sessão encontrada para o usuário')
  }

  return sessions
}

async function deleteUserSession(accessToken) {
  const session = await Session.findOne({ where: { accessToken } })

  if (!session) {
    throw new Error('Sessão não encontrada')
  }

  await session.destroy()
}

async function handleLogin(res, type, identification, password, userAgent) {
  const parser = new UAParser()
  const device = parser.setUA(userAgent).getResult()
  let user

  switch (type) {
    case 'traditional': {
      user = await User.findOne({ where: checkIfUserIsValid(identification) })
      if (!user) throw new Error('Usuário não encontrado.')

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
      if (!isPasswordValid) throw new Error('Senha inválida.')
      break
    }

    case 'google': {
      const client = new OAuth2Client(process.env.VITE_GCLIENT_LOGIN_ID)
      const ticket = await client.verifyIdToken({
        idToken: identification,
        audience: process.env.VITE_GCLIENT_LOGIN_ID,
      })
      const payload = ticket.getPayload()
      user = await User.findOne({ where: { email: payload.email } })
      if (!user) throw new Error('Usuário não encontrado.')
      break
    }

    default:
      throw new Error('Tipo de login inválido.')
  }

  const { accessToken, refreshToken } = await createUserSession(user.id, device)
  createClientCookie(res, accessToken, refreshToken)
  return { accessToken, refreshToken }
}

export {
  createUserSession,
  verifyAndRenewSession,
  logoutAllSessions,
  getAnyUserSession,
  deleteUserSession,
  handleLogin,
}
