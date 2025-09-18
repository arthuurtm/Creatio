import log from '../helpers/console.js'

export const errorHandler = (err, req, res, next) => {
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
}
