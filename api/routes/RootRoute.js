import { Router } from 'express'
import { handleOAuthCallback } from '../services/EmailService.js'
const router = Router()

router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query
  await handleOAuthCallback(code)
  res.send('Autenticado com sucesso, pode fechar a janela!')
})

let RootRoute = router
export default RootRoute
