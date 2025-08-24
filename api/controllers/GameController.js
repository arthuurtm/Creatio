import { getAnyGame, setGameOnDatabase } from '../services/GameService.js'

async function getAnyGameController(req, res, next) {
  try {
    const { filters } = req.query
    res.json(await getAnyGame(filters))
  } catch (err) {
    next(err)
  }
}

async function setGameOnDatabaseController(req, res, next) {
  try {
    const { title, description } = req?.body
    const { id: userId } = req.user
    const result = await setGameOnDatabase({ title, description, userId })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export { getAnyGameController, setGameOnDatabaseController }
