import { WebSocketServer } from 'ws'
import { WebsocketRoute as handleConnection } from '../routes/index.js'
import log from '../helpers/console.js'

/**
 * Inicializa e anexa o servidor WebSocket a um servidor HTTP existente.
 * @param {import('http').Server} server - A instância do servidor HTTP.
 * @returns {WebSocketServer} A instância do servidor WebSocket criada.
 */
function initializeWebSocket(server) {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws, req) => {
    log.success('Cliente WebSocket conectado!')

    handleConnection(ws, wss)

    ws.on('error', (error) => {
      log.error('Erro no WebSocket: ', error)
    })
  })

  return wss
}

export default initializeWebSocket
