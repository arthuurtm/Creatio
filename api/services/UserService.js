import { User, Session } from '../models/index.js'
import { setUserDatabaseQuery } from '../helpers/query.js'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { setVerificationCode, getVerifyCode } from '../services/2FAService.js'
import { sendEmailService } from '../services/EmailService.js'
import log from '../helpers/console.js'

async function getBasicUserData(id) {
  if (!id) throw new Error('Parâmetros insuficientes')

  const query = setUserDatabaseQuery(id)
  const user = await User.findOne({
    where: query,
    include: [{ model: Session }],
  })
  if (!user) return null

  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    profilePic: user.profilePic,
    exists: true,
  }
}

async function signupUser({
  nickname,
  username,
  email,
  birthdate,
  password,
  verificationCode,
  codeId,
}) {
  const { valid } = getVerifyCode(codeId, verificationCode)
  if (!valid) throw new Error('Código inválido.')

  const birthDateObj = new Date(birthdate)
  if (isNaN(birthDateObj.getTime())) throw new Error('Data de nascimento inválida')

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await User.create({
    nickname,
    username,
    email,
    birthdate,
    passwordHash,
  })

  return user
}

async function setSignupCode(email) {
  if (!email) throw new Error('Digite um e-mail!')

  const { id, code } = setVerificationCode(15)
  await sendEmailService({
    template: 'signupVerify',
    to: email,
    subject: 'Verifique seu e-mail',
    verificationCode: code,
  })
  return { id, code }
}

export { getBasicUserData, signupUser, setSignupCode }
