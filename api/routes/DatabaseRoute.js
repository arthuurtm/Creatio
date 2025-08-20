import { Router } from 'express'
import isAuthenticated from '../middlewares/isAuthenticated.js'
import log from '../helpers/console.js'
import { reqLimiter } from '../helpers/limiter.js'

import { handleLogin } from '../services/UserSessionService.js'
import { getBasicUserData } from '../services/UserService.js'
import { setVerificationCode } from '../services/2FAService.js'
import { sendEmailService } from '../services/EmailService.js'

import '../templates/signupVerifyEmail.html' as

const router = Router()
router.post('/setLogin', async (req, res) => {
  const { type, identification, password, userAgent } = req.body
  try {
    await handleLogin(res, type, identification, password, userAgent)
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
    await getBasicUserData(req)
  } catch (error) {
    log.error('Erro na rota /getUserBasics:', error)
    res.status(400).json({ message: error.message })
  }
})

router.post('/setSignupCode', async (req, res) => {
  try {
    const { id, code } = setVerificationCode(15)
    sendEmailService()
  } catch (error) {}
})

router.post('/setUser', async (req, res) => {})

router.get('/getAllUserSessions', isAuthenticated, async (req, res) => {})

router.delete('/deleteSession', isAuthenticated, async (req, res) => {})

router.get('/getGames', async (req, res) => {})

router.post('/setGame', reqLimiter(1, 12), isAuthenticated, async (req, res) => {})

router.delete('/logout', (req, res) => {})

router.delete('/logoutAll', isAuthenticated, async (req, res) => {})

let DatabaseRouter = router
export default DatabaseRouter
