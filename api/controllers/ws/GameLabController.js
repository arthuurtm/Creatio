import GameEditorService from '../../services/EditorService.js'

export default {
  async updateJson({ ws, wss, data }) {
    try {
      const gameState = data
      const { id, version } = gameState.info || {}
      const accessToken = ws.cookies.accessToken
      const objectName = await GameEditorService.saveState({
        id,
        version,
        state: gameState,
        accessToken,
      })
      ws.send(
        JSON.stringify({
          event: 'game:lab:update:json:success',
          data: { objectName },
        }),
      )
    } catch (err) {
      ws.send(
        JSON.stringify({
          event: 'game:lab:update:json:error',
          data: { message: err.message },
        }),
      )
    }
  },

  async getJson({ ws, wss, data }) {
    try {
      const { id, version } = data
      const accessToken = ws.cookies.accessToken
      const result = await GameEditorService.getState({
        id,
        version,
        accessToken,
      })
      ws.send(
        JSON.stringify({
          event: 'game:lab:get:json:success',
          data: result,
        }),
      )
    } catch (err) {
      ws.send(
        JSON.stringify({
          event: 'game:lab:get:json:error',
          data: { message: err.message },
        }),
      )
    }
  },
}
