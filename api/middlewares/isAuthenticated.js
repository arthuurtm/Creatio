import { verifyAndRenewSession } from '../services/UserSessionService.js'
import { createClientCookie } from '../services/ClientSessionService.js'
import log from '../helpers/console.js'

async function isAuthenticated(req, res, next) {
  try {
    let { accessToken, refreshToken } = req?.cookies || {}
    const { user, newAccessToken, newRefreshToken, renewNeeded } =
      (await verifyAndRenewSession({ accessToken, refreshToken })) || {}
    accessToken = newAccessToken || accessToken
    refreshToken = newRefreshToken || refreshToken

    if (!accessToken || !user) {
      return res.status(401).json({ error: 'Não autorizado' })
    }

    if (renewNeeded) createClientCookie(res, accessToken, refreshToken)

    const secureData = { ...user.get({ plain: true }) }
    delete secureData.passwordHash

    req.user = secureData
    req.accessToken = accessToken
    req.refreshToken = refreshToken

    next()
  } catch (err) {
    next(err)
  }
}

export default isAuthenticated
