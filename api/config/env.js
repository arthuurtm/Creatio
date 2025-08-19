import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import log from '../helpers/console.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, '../../.env')

const result = dotenv.config({ path: envPath })

if (result.error) {
  log.error('Erro ao carregar o arquivo .env:', result.error)
} else {
  log.info('Variáveis de ambiente carregadas com sucesso.')
}
