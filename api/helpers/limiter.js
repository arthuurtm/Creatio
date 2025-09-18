import rateLimit from 'express-rate-limit'

export function reqLimiter(max, timeout, message) {
  max = max || 3
  let windowMs = 60 * 60 * 1000 * timeout
  message = message || 'Tente novamente mais tarde'
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000),
      })
    },
  })
}
