import {
  signupUser,
  setVerificationCodeAndSendEmail,
  resetUserPassword,
  getBasicUserData,
} from '../services/UserService.js'
import { handleLogin } from '../services/UserSessionService.js'
import { createClientCookie } from '../services/ClientSessionService.js'
import { validateCodeAndGetUUID } from '../services/2FAService.js'

async function getBasicUserDataController(req, res, next) {
  try {
    const { userId, identification } = req?.query
    const id = userId || identification
    const data = await getBasicUserData(id)
    if (!data) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function handleLoginController(req, res, next) {
  const { type, identification, password, userAgent } = req.body
  try {
    const { accessToken, refreshToken, user } = await handleLogin(
      type,
      identification,
      password,
      userAgent,
    )
    await createClientCookie(res, accessToken, refreshToken)
    res.send()
  } catch (err) {
    next(err)
  }
}

async function getUserDataController(req, res, next) {
  try {
    res.json(req.user)
  } catch (err) {
    next(err)
  }
}

async function setSignupCodeController(req, res, next) {
  try {
    const { email } = req.body
    const result = await setVerificationCodeAndSendEmail({
      email,
      template: 'signupVerify',
      subject: 'Verifique seu e-mail!',
      timeout: null,
    })
    res.json({ expiresAt: result.expiresAt })
  } catch (err) {
    next(err)
  }
}

async function setResetPasswordCodeController(req, res, next) {
  try {
    const { email } = req.body
    const result = await setVerificationCodeAndSendEmail({
      email,
      template: 'resetPassword',
      subject: 'Seu código para redefinir a senha',
      timeout: null,
    })
    res.json({ expiresAt: result.expiresAt })
  } catch (err) {
    next(err)
  }
}

async function validateSecureSession(req, res, next) {
  try {
    const { secureToken: token, tokenId: id } = req.body
    const { valid, uuid } = await validateCodeAndGetUUID(id, token)
    if (!valid) {
      throw new Error('Código inválido ou expirado')
    }

    res.status(200).json({ sessionUUID: uuid })
  } catch (err) {
    next(err)
  }
}

async function signupUserController(req, res, next) {
  try {
    const user = await signupUser(req.body)
    res.status(201).json({ user })
  } catch (err) {
    next(err)
  }
}

async function resetUserPasswordController(req, res, next) {
  try {
    const { newPassword, sessionUUID } = req.body
    await resetUserPassword({ newPassword, sessionUUID })
    res.send()
  } catch (err) {
    next(err)
  }
}

export {
  getBasicUserDataController,
  signupUserController,
  setSignupCodeController,
  handleLoginController,
  getUserDataController,
  validateSecureSession,
  setResetPasswordCodeController,
  resetUserPasswordController,
}
