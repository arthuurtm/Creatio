import { Router } from 'express'
import { handleOAuthCallback } from '../services/EmailService.js'
import log from '../helpers/console.js'
const router = Router()

router.get('/oauth2callback', async (req, res) => {
  try {
    const { code } = req.query
    await handleOAuthCallback(code)
    res.send('Autenticado com sucesso, pode fechar a janela!')
  } catch {
    log.warn('Solicitação negada em oauth2callback')
    res.status(403).send()
  }
})

let RootRoute = router
export default RootRoute
