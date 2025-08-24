import { User, Session } from '../models/index.js'
import { setUserDatabaseQuery } from '../helpers/query.js'
import bcrypt from 'bcrypt'
import { consumeVerificationUUID, createVerificationCode } from '../services/2FAService.js'
import { sendEmailService } from '../services/EmailService.js'

async function getBasicUserData(id) {
  if (!id) throw new Error('Parâmetros insuficientes')

  const query = setUserDatabaseQuery({ value: id })
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

async function setVerificationCodeAndSendEmail({
  email = null,
  template,
  subject,
  timeout,
  extraData = {},
}) {
  const { id, code, expiresAt } = await createVerificationCode(timeout, email)
  extraData.verificationCode = code

  await sendEmailService({
    template,
    to: email,
    subject,
    ...extraData,
  })

  return { id, code, expiresAt }
}

async function signupUser({ nickname, username, email, birthdate, password, sessionUUID }) {
  await consumeVerificationUUID(sessionUUID)
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

async function resetUserPassword({ newPassword, sessionUUID }) {
  const { id: email } = await consumeVerificationUUID(sessionUUID)

  const user = await User.findOne({ where: { email } })
  const passwordHash = await bcrypt.hash(newPassword, 10)
  user.passwordHash = passwordHash
  await user.save()

  await sendEmailService({
    template: 'resetedPassword',
    to: email,
    subject: 'A senha da sua conta foi redefinida!',
    username: user.nickname,
  })
}

export { getBasicUserData, signupUser, setVerificationCodeAndSendEmail, resetUserPassword }
