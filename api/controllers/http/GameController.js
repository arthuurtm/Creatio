import { getAnyGame, setGameOnDatabase } from '../../services/GameService.js'

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
    // 1. Recebe os dados (state.info.id aqui ainda é null)
    const { title, description, version, state } = req?.body
    const { id: userId } = req?.user
    const { accessToken } = req
    const result = await setGameOnDatabase({
      title,
      description,
      userId,
      accessToken,
      state,
      version,
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export { getAnyGameController, setGameOnDatabaseController }
