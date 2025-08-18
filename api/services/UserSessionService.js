import jwt from 'jsonwebtoken'
import Session from '../models/Session.js'
import User from '../models/User.js'
import { createClientSession, createClientCookie } from './ClientSessionService.js'
import { Op } from 'sequelize'

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

export { createUserSession, verifyAndRenewSession, logoutAllSessions }
