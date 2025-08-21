import * as UserService from '../services/UserService.js'

async function getBasicUserDataController(req, res, next) {
  try {
    const data = await UserService.getBasicUserData(req.query)
    if (!data) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function signupUserController(req, res, next) {
  try {
    const user = await UserService.signupUser(req.body)
    res.status(201).json({ user })
  } catch (err) {
    next(err)
  }
}

async function setSignupCodeController(req, res, next) {
  try {
    const { email } = req.body
    const result = await UserService.setSignupCode(email)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export { getBasicUserDataController, signupUserController, setSignupCodeController }
