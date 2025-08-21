import './config/env.js'
import express from 'express'
import { DatabaseRouter, RootRoute } from './routes/index.js'
import log from './helpers/console.js'
import cookieParser from 'cookie-parser'
import { authenticateService } from './services/EmailService.js'

await authenticateService()
const app = express()
app.use(express.json())
app.use(cookieParser())

app.use('/api/database', DatabaseRouter)
app.use('/api', RootRoute)
app.use((req, res, next) => {
  log.info(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})
app.listen(3000, () => log.info('Servidor rodando em http://localhost:3000'))
