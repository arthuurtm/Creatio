import { sendEmailService, authenticateService } from '../services/EmailService.js'
import log from '../helpers/console.js'

async function sendEmail(req) {
  try {
    await sendEmailService(req)
    return true
  } catch (err) {
    log.error('Erro ao enviar e-mail:', err)
    return false
  }
}

async function authenticate(req, res) {
  try {
    const url = await authenticateService()
    res.send(`Abra este URL: ${url}`)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export { sendEmail, authenticate }
