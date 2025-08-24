import jwt from 'jsonwebtoken'
import log from '../helpers/console.js'

async function createClientSession(userId, device) {
  const accessToken = jwt.sign({ userId, device }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  })
  const refreshToken = jwt.sign({ userId, device }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  })

  return { accessToken, refreshToken }
}

async function createClientCookie(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 15 * 60 * 1000,
  })
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
}

export { createClientSession, createClientCookie }
