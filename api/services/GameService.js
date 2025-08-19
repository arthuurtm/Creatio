import { Game } from '../models/index.js'

async function getAnyGame(filters = {}) {
  const games = await Game.findAll({
    where: filters ? JSON.parse(filters) : {},
  })
  if (games.length === 0) throw new Error('Nenhum jogo encontrado')
}

async function setGameOnDatabase(params) {
  const { title, description } = params

  const game = await Game.create({
    title,
    description,
    userId: params.userId,
  })

  if (!game) throw new Error('Erro ao criar o jogo')
  return game
}

export { getAnyGame, setGameOnDatabase }
