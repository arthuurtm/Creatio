import { Router } from 'express'
import isAuthenticated from '../middlewares/isAuthenticated.js'
import log from '../helpers/console.js'
import { reqLimiter } from '../helpers/limiter.js'

import { handleLogin } from '../services/UserSessionService.js'
import { getBasicUserData } from '../services/UserService.js'
import { setSignupCode } from '../services/UserService.js'
import { createClientCookie } from '../services/ClientSessionService.js'

const router = Router()
router.post('/setLogin', async (req, res) => {
  const { type, identification, password, userAgent } = req.body
  try {
    const { accessToken, refreshToken } = await handleLogin(
      type,
      identification,
      password,
      userAgent,
    )
    createClientCookie(res, accessToken, refreshToken)
    res.status(200)
  } catch (error) {
    log.error('Erro na rota /setLogin:', error)
    res.status(400).json({ message: error.message })
  }
})

router.get('/getUserData', isAuthenticated, async (req, res) => {
  res.status(200).json(req.user)
})

router.get('/getUserBasics', async (req, res) => {
  try {
    const { userId, identification } = req?.query
    const id = userId || identification
    const data = await getBasicUserData(id)
    res.status(200).json(data)
  } catch (error) {
    log.error('Erro na rota /getUserBasics:', error)
    res.status(400).json({ message: error.message })
  }
})

router.post('/setSignupCode', async (req, res) => {
  try {
    const { email } = req.body
    const { id } = await setSignupCode(email)
    res.status(200).json({ id })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/setUser', async (req, res) => {})

router.get('/getAllUserSessions', isAuthenticated, async (req, res) => {})

router.delete('/deleteSession', isAuthenticated, async (req, res) => {})

router.get('/getGames', async (req, res) => {})

router.post('/setGame', reqLimiter(1, 12), isAuthenticated, async (req, res) => {})

router.delete('/logout', (req, res) => {
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
  res.status(200).json({ message: 'Usuário deslogado com sucesso' })
})

router.delete('/logoutAll', isAuthenticated, async (req, res) => {})

let DatabaseRouter = router
export default DatabaseRouter
