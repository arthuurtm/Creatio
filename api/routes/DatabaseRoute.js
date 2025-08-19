import { Router } from 'express'
import isAuthenticated from '../middlewares/isAuthenticated.js'
import log from '../helpers/console.js'
import { reqLimiter } from '../helpers/limiter.js'

import { handleLogin } from '../services/UserSessionService.js'

const router = Router()
router.use((req, res, next) => {
  try {
    next()
  } catch (error) {
    log.error('DatabaseRoute: ' + error || 'Erro inesperado no DatabaseRoute')
    res.status(500).json({ messsage: 'Erro interno no servidor' })
  }
})

router.post('/setLogin', async (req, res) => {
  const { type, identification, password, userAgent } = req.body
  try {
    await handleLogin(res, type, identification, password, userAgent)
  } catch (error) {
    res.status(400).json({ message: error })
  }
})
router.get('/getUserData', isAuthenticated, async (req, res) => {
  res.status(200).json(req.user)
})
router.get('/getUserBasics', async (req, res) => {})
router.post('/setSignupCode', async (req, res) => {})
router.post('/setUser', async (req, res) => {})
router.get('/getAllUserSessions', isAuthenticated, async (req, res) => {})
router.delete('/deleteSession', isAuthenticated, async (req, res) => {})
router.get('/getGames', async (req, res) => {})
router.post('/setGame', reqLimiter(1, 12), isAuthenticated, async (req, res) => {})
router.delete('/logout', (req, res) => {})
router.delete('/logoutAll', isAuthenticated, async (req, res) => {})

let DatabaseRouter = router
export default DatabaseRouter
