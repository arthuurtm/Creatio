import express from 'express'
import http from 'http'
import { WebSocketServer } from 'ws'
import * as request from '../src/functions/functions.js'

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
  console.log('🧠 Novo cliente conectado')

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message)

      switch (data.type) {
        case 'create_game': {
          const game = {
            title: data.name || 'Novo Jogo',
            description: data.description || '',
            genre: data.genre || '',
            userId: data.userId,
          }
          request
            .post({ type: 'database', route: 'games' }, game)
            .then((res) => {
              if (res.okay) {
                ws.send(
                  JSON.stringify({
                    type: 'game_created',
                    game: res.details,
                  }),
                )
                console.log(`✅ Jogo criado`)
              } else {
                ws.send(
                  JSON.stringify({
                    type: 'error',
                    message: res.details.message,
                  }),
                )
                console.log(`🚫 Erro ao criar jogo`)
              }
            })
            .catch((err) => {
              ws.send(
                JSON.stringify({
                  type: 'error',
                  message: err.message,
                }),
              )
              console.log(`🚫 Erro interno no servidor`)
            })

          break
        }

        default: {
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Erro de desconhecido. Tente novamente mais tarde.',
            }),
          )
        }
      }
    } catch (err) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Formato inválido',
        }),
      )
    }
  })

  ws.on('close', () => {
    console.log('📴 Cliente desconectado')
  })
})

const port = 3002
server.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`)
})
