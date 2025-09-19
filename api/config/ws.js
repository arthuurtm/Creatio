import { WebSocketServer } from 'ws'
import { WebsocketRoute as handleConnection } from '../routes/index.js'
import log from '../helpers/console.js'
import cookie from 'cookie'

/**
 * Inicializa e anexa o servidor WebSocket a um servidor HTTP existente.
 * @param {import('http').Server} server - A instância do servidor HTTP.
 * @returns {WebSocketServer} A instância do servidor WebSocket criada.
 */
function initializeWebSocket(server) {
  const wss = new WebSocketServer({ server: server, path: '/ws' })

  wss.on('connection', (ws, req) => {
    log.success('Cliente WebSocket conectado!')

    const cookies = cookie.parse(req.headers.cookie || '')
    handleConnection(ws, wss, cookies)

    ws.on('error', (error) => {
      log.error('Erro no WebSocket: ', error)
    })
  })

  return wss
}

export default initializeWebSocket
