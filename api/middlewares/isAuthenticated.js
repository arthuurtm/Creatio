import { verifyAndRenewSession } from '../services/UserSessionService.js'
import log from '../helpers/console.js'

async function isAuthenticated(req, res, next) {
  try {
    //const { accessToken, refreshToken } = req?.cookies || {}
    const session = await verifyAndRenewSession(req, res)

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Não autorizado' })
    }

    const secureData = { ...session.user.get({ plain: true }) }
    delete secureData.passwordHash

    req.user = secureData
    req.accessToken = session.accessToken
    req.refreshToken = session.refreshToken

    next()
  } catch(error) {
    log.error("Erro grave no middleware 'isAuthenticated': ", error)
  }
}

export default isAuthenticated
