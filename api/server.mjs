import './config/env.js'
import server from './config/index.js'
import log from './helpers/console.js'
import { authenticateService } from './services/EmailService.js'

const PORT = 3000
const startServer = async () => {
  try {
    // Lógicas de inicialização
    const authUrl = await authenticateService()
    log.info(`Abrindo no navegador [${authUrl}]`)

    // Inicia o servidor
    server.listen(PORT, () => {
      log.info(`Servidor rodando em http://localhost:${PORT}`)
    })
  } catch (error) {
    log.error('Falha ao iniciar o servidor:', error)
    process.exit(1)
  }
}

startServer()
