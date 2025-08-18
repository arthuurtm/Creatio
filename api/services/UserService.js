import { User, Session } from '../models'

async function getUserBasics(query) {
  if (!query) {
    throw new Error('Parâmetros insuficientes')
  }

  let user = null

  if (accessToken) {
    const session = await Session.findOne({
      where: { accessToken },
      include: [{ model: User }],
    })
    user = session ? session.User : null
  } else if (userId) {
    user = await User.findOne({ where: { id: userId } })
  } else if (identification) {
    user = await User.findOne({ where: checkIfUserIsValid(identification) })
  }

  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })

  res.status(200).json({
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    profilePic: user.profilePic,
    exists: true,
  })
}
