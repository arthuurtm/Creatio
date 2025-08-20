import { generateRandomNumbers } from '../helpers/numbers.js'
let verificationCodesDB = []

/**
 * Salva um novo código de verificação para um email.
 * Remove qualquer código antigo para o mesmo email antes de adicionar o novo.
 * @param {number} [timeout=5] - O tempo em minutos até o código expirar (padrão é 5 minutos).
 * @returns {Promise<object>} O registro do código que foi salvo.
 */
async function setVerificationCode(timeout = 5) {
  const id = crypto.randomUUID()
  verificationCodesDB = verificationCodesDB.filter((entry) => entry.id !== id)

  const expirationDate = new Date()
  expirationDate.setMinutes(expirationDate.getMinutes() + timeout)

  const newCodeEntry = {
    id: id,
    code: generateRandomNumbers(),
    expiresAt: expirationDate,
  }

  verificationCodesDB.push(newCodeEntry)
  return Promise.resolve(newCodeEntry)
}

/**
 * Encontra e valida um código de verificação.
 * Se o código for válido e não estiver expirado, ele é removido para não ser usado novamente.
 * @param {any} id - identificação do código.
 * @param {string} code - O código que o usuário forneceu.
 * @returns {Promise<{valid: boolean, reason: string}>} Um objeto indicando se o código é válido.
 */
async function getVerifyCode(id, code) {
  const foundEntry = verificationCodesDB.find((entry) => entry.id === id && entry.code === code)

  if (!foundEntry) {
    throw new Error('Código não encontrado ou inválido')
  }

  if (new Date() > foundEntry.expiresAt) {
    verificationCodesDB = verificationCodesDB.filter((entry) => entry.code !== code)
    throw new Error('Código expirado')
  }

  verificationCodesDB = verificationCodesDB.filter((entry) => entry.code !== code)
  return Promise.resolve({ valid: true, reason: 'Código verificado com sucesso!' })
}

export { setVerificationCode, getVerifyCode }
