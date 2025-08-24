import './config/env.js'
import express from 'express'
import { DatabaseRouter, RootRoute } from './routes/index.js'
import log from './helpers/console.js'
import cookieParser from 'cookie-parser'
import { authenticateService } from './services/EmailService.js'

log.info(`Abrindo no navegador [${await authenticateService()}]`)
const app = express()
app.use(express.json())
app.use(cookieParser())

app.use((req, res, next) => {
  log.info('Requisição recebida: ', req.method, req.originalUrl)
  next()
})
app.use('/api/database', DatabaseRouter)
app.use('/api', RootRoute)
app.use((err, req, res, next) => {
  if (err instanceof Error) {
    log.error(err.stack)
  } else {
    log.error(err)
  }
  const status = err.status || 500

  res.status(status).json({
    success: false,
    ...(err instanceof Error && err.message ? { message: err.message } : {}),
  })
})

app.listen(3000, () => log.info('Servidor rodando em http://localhost:3000'))
