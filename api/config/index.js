import './env.js'
import app from './app.js'
import initializeWebSocket from './ws.js'
import http from 'http'

const server = http.createServer(app)
initializeWebSocket(server)

export default server
