import FileService from '../../services/FileService.js'
import log from '../../helpers/console.js'
import { gamePathGenerator, getFileExtension } from '../../helpers/query.js'
import { validateGameOwnership } from '../../services/GameService.js'

async function updateJson({ ws, wss, data }) {
  try {
    const key = `game_${data.gameId}_editor`
    await validateGameOwnership(data.gameId, data.accessToken)

    const objectName = await FileService.write.queueSave(key, data.state, {
      bucket: 'private',
      meta: { 'Content-Type': 'application/json' },
      objectNameGenerator: () => `${gamePathGenerator(data.gameId, data.version)}/editor.json`,
    })

    ws.send(JSON.stringify({ event: 'game:lab:update:json:success', data: { objectName } }))
  } catch (err) {
    const message = JSON.stringify({
      event: 'game:lab:update:json:error',
      data: { message: err.message },
    })
    ws.send(message)
  }
}

async function getJson({ ws, wss, data }) {
  try {
    const { gameId, version } = data
    const fileName = `${gamePathGenerator(data.gameId, data.version)}/editor.json`
    await validateGameOwnership(data.gameId, data.accessToken)

    const result = await FileService.read.readJson('private', fileName)

    ws.send(JSON.stringify({ event: 'game:lab:get:json:success', data: result }))
  } catch (err) {
    const message = JSON.stringify({
      event: 'game:lab:get:json:error',
      data: { message: err.message },
    })
    ws.send(message)
  }
}

export default { updateJson, getJson }
