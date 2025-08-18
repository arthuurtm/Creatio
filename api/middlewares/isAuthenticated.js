import { verifyAndRenewSession } from '../services/SessionService.js'

async function isAuthenticated(req, res, next) {
  const { accessToken, refreshToken } = req.cookies
  const session = await verifyAndRenewSession(accessToken, refreshToken)

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  const secureData = { ...session.user.get({ plain: true }) }
  delete secureData.passwordHash

  req.user = secureData
  req.accessToken = session.accessToken
  req.refreshToken = session.refreshToken

  next()
}

export default isAuthenticated
