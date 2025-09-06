import FileService from '../../services/FileService.js'

async function update({ ws, wss, data }) {
  const key = `game_${data.gameId}_editor`

  FileService.write
    .queueSave(key, data.state, {
      bucket: 'private',
      meta: { 'Content-Type': 'application/json' },
      objectNameGenerator: () => `games/${data.gameId}/version-${data.version}.json`,
    })
    .then((objectName) => {
      ws.send(JSON.stringify({ event: 'game:lab:update:success', data: { objectName } }))
    })
    .catch((err) => {
      ws.send(JSON.stringify({ event: 'game:lab:update:error', data: { message: err.message } }))
    })
}

async function get({ ws, wss, data }) {
  FileService.read
    .readJson('private', data.fileName)
    .then((result) => {
      ws.send(JSON.stringify({ event: 'game:lab:get:success', data: result }))
    })
    .catch((err) => {
      ws.send(JSON.stringify({ event: 'game:lab:get:error', data: { message: err.message } }))
    })
}

export default { update, get }
