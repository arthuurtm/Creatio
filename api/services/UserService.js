import { User, Session } from '../models/index.js'
import { setUserDatabaseQuery } from '../helpers/query.js'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

async function getBasicUserData(query) {
  if (!query) {
    throw new Error('Parâmetros insuficientes')
  }
  query = setUserDatabaseQuery(query)

  const user = await User.findOne({
    where: { query },
    include: [{ model: Session }],
  })
  if (!user) return false

  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    profilePic: user.profilePic,
    exists: true,
  }
}

async function signupUser(data = {}) {
  const { nickname, username, email, birthdate, password } = data

  const currentDate = new Date()
  const birthDateObj = new Date(birthdate)
  if (isNaN(birthDateObj.getTime()) > currentDate) {
    throw new Error('Data de nascimento inválida')
  }

  const [passwordHash, sessionToken] = await Promise.all([bcrypt.hash(password, 10), uuidv4()])

  const user = await User.create({
    nickname,
    username,
    email,
    birthdate,
    passwordHash,
    sessionToken,
  })

  return user
}

export { getBasicUserData, signupUser }
