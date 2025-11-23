import log from '../helpers/console.js'
import GameLabController from '../controllers/ws/GameLabController.js'

const routes = {
  'game:lab:get:json': GameLabController.getJson,
  'game:lab:update:json': GameLabController.updateJson,
  'game:lab:upgrade': null,
  'game:join': null,
  'game:leave': null,
}

const handleConnection = (ws, wss) => {
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message)
      log.info('Evento WebSocket recebido: ', data.event)

      // Encontra a função do controller baseada no evento
      const handler = routes[data.event]

      if (handler) {
        // Cria um objeto de contexto para passar informações úteis
        const context = { ws, wss, data: data.payload }
        await handler(context)
      } else {
        log.warn(`Nenhum handler encontrado para o evento: ${data.event}`)
        ws.send(JSON.stringify({ error: `Evento '${data.event}' desconhecido.` }))
      }
    } catch (error) {
      log.error('Erro ao processar a mensagem:', error)
      ws.send(JSON.stringify({ error: 'Mensagem inválida.' }))
    }
  })
}

let WebsocketRoute = handleConnection

export default WebsocketRoute
