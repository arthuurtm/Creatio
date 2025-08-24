import log from '../helpers/console.js'
import { getAnyUserSession, logoutAllSessions } from '../services/UserSessionService.js'

async function logoutAllSessionsController(req, res, next) {
  try {
    const { id: userId, accessToken } = req.user
    res.send(await logoutAllSessions(userId, accessToken))
  } catch (err) {
    next(err)
  }
}

async function getAnyUserSessionController(req, res, next) {
  try {
    const { id: userId } = req?.user
    const result = await getAnyUserSession(userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function logoutUserController(req, res, next) {
  try {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.json({ message: 'Usuário deslogado com sucesso' })
  } catch (err) {
    next(err)
  }
}

export { logoutAllSessionsController, getAnyUserSessionController, logoutUserController }
