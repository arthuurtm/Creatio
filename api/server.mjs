import express from 'express'
import { DatabaseRouter } from './routes/index.js'

const app = express()
app.use(express.json())

app.use('/api/database', DatabaseRouter)

app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'))
