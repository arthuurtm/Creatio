import express from 'express'
import cookieParser from 'cookie-parser'
import { DatabaseRouter, RootRoute } from '../routes/index.js'
import { requestLogger } from '../middlewares/requestLogger.js'
import { errorHandler } from '../middlewares/errorHandler.js'

const app = express()
app.use(express.json())
app.use(cookieParser())
// Logs
app.use(requestLogger)
// Rotas
app.use('/api/database', DatabaseRouter)
app.use('/api', RootRoute)
// Erros
app.use(errorHandler)

export default app
