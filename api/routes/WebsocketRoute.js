import log from '../helpers/console.js'

const routes = {
  'game:create:init': null,
  'game:create:update': null,
  'game:create:save': null,
  'game:join': null,
  'game:leave': null,
  'game:state:sync': null,
}

const handleConnection = (ws, wss) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message)

      // Encontra a função do controller baseada no evento
      const handler = routes[data.event]

      if (handler) {
        // Cria um objeto de contexto para passar informações úteis
        const context = { ws, wss, payload: data.payload }
        handler(context)
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
