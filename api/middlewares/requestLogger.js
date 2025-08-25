import log from '../helpers/console.js'

export const requestLogger = (req, res, next) => {
  log.info('Requisição recebida: ', req.method, req.originalUrl)
  next()
}
