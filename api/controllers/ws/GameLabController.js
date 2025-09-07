import FileService from '../../services/FileService.js'
import log from '../../helpers/console.js'

async function update({ ws, wss, data }) {
  try {
    const key = `game_${data.gameId}_editor`

    const objectName = await FileService.write.queueSave(key, data.state, {
      bucket: 'private',
      meta: { 'Content-Type': 'application/json' },
      objectNameGenerator: () => `games/${data.gameId}/version-${data.version}.json`,
    })

    ws.send(JSON.stringify({ event: 'game:lab:update:success', data: { objectName } }))
  } catch (err) {
    const message = JSON.stringify({
      event: 'game:lab:update:error',
      data: { message: err.message },
    })
    ws.send(message)
  }
}

async function get({ ws, wss, data }) {
  try {
    const { gameId, version } = data
    const fileName = `games/${data.gameId}/version-${data.version}.json`

    const result = await FileService.read.readJson('private', fileName)

    ws.send(JSON.stringify({ event: 'game:lab:get:success', data: result }))
  } catch (err) {
    const message = JSON.stringify({
      event: 'game:lab:get:error',
      data: { message: err.message },
    })
    ws.send(message)
  }
}

export default { update, get }
