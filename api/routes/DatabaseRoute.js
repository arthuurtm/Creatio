import { Router } from 'express'
import isAuthenticated from '../middlewares/isAuthenticated.js'
import { reqLimiter } from '../helpers/limiter.js'
import {
  setSignupCodeController,
  signupUserController,
  getBasicUserDataController,
  handleLoginController,
  getUserDataController,
  setResetPasswordCodeController,
  validateSecureSession,
  resetUserPasswordController,
} from '../controllers/UserController.js'
import { getAnyGameController, setGameOnDatabaseController } from '../controllers/GameController.js'
import {
  getAnyUserSessionController,
  logoutAllSessionsController,
  logoutUserController,
} from '../controllers/UserSessionController.js'

const router = Router()
// precisa de autenticação
router.get('/getUserData', isAuthenticated, getUserDataController)
router.get('/getAllUserSessions', isAuthenticated, getAnyUserSessionController)
router.delete('/deleteSession', isAuthenticated, async (req, res) => {})
router.delete('/logoutAll', isAuthenticated, logoutAllSessionsController)
router.delete('/logout', isAuthenticated, logoutUserController)
router.post('/setGame', reqLimiter(1, 12), isAuthenticated, setGameOnDatabaseController)

// não precisa de autenticação
router.post('/setLogin', handleLoginController)
router.get('/getUserBasics', getBasicUserDataController)
router.get('/getGames', getAnyGameController)
router.post('/setSignupCode', setSignupCodeController)
router.post('/setResetPassCode', setResetPasswordCodeController)
router.post('/setUser', signupUserController)
router.post('/setUserPassword', resetUserPasswordController)
router.post('/validateSecureSession', validateSecureSession)

let DatabaseRouter = router
export default DatabaseRouter
