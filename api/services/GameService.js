import { Game } from '../models/index.js'

async function getAnyGame(filters = {}) {
  let where = {}

  if (filters) {
    if (typeof filters === 'string') {
      try {
        where = JSON.parse(filters)
      } catch (err) {
        throw new Error('Filters inválido, precisa ser JSON válido')
      }
    } else if (typeof filters === 'object') {
      where = filters
    }
  }
  const games = await Game.findAll({ where })

  if (games.length === 0) throw new Error('Nenhum jogo encontrado')
  return games
}

async function setGameOnDatabase({ title, description, userId }) {
  const game = await Game.create({
    title,
    description,
    userId,
  })

  if (!game) throw new Error('Erro ao criar o jogo')
  return game
}

export { getAnyGame, setGameOnDatabase }
