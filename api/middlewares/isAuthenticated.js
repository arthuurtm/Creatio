import { verifyAndRenewSession } from '../services/UserSessionService.js'
import log from '../helpers/console.js'
import { createClientCookie } from '../services/ClientSessionService.js'

async function isAuthenticated(req, res, next) {
  try {
    //const { accessToken, refreshToken } = req?.cookies || {}
    const { user, accessToken, refreshToken, renewNeeded } =
      (await verifyAndRenewSession(req, res)) || {}

    if (!refreshToken || !user) {
      return res.status(401).json({ error: 'Não autorizado' })
    }

    if (renewNeeded) createClientCookie(res, accessToken, refreshToken)

    const secureData = { ...session.user.get({ plain: true }) }
    delete secureData.passwordHash

    req.user = secureData
    req.accessToken = session.accessToken
    req.refreshToken = session.refreshToken

    next()
  } catch (error) {
    log.error("Erro grave no middleware 'isAuthenticated': ", error)
  }
}

export default isAuthenticated
