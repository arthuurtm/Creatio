import './config/env.js'
import express from 'express'
import { DatabaseRouter } from './routes/index.js'
import log from './helpers/console.js'
import cookieParser from 'cookie-parser'

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use('/api/database', DatabaseRouter)

app.listen(3000, () => log.info('Servidor rodando em http://localhost:3000'))
