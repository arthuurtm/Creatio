import express from 'express'
import cookieParser from 'cookie-parser'
import { DatabaseRouter, RootRoute } from '../routes/index.js'
import { requestLogger } from '../middlewares/requestLogger.js'
import { errorHandler } from '../middlewares/errorHandler.js'

const http = express()
http.use(express.json())
http.use(cookieParser())
// Logs
http.use(requestLogger)
// Rotas
http.use('/api/database', DatabaseRouter)
http.use('/api', RootRoute)
// Erros
http.use(errorHandler)

export default http
