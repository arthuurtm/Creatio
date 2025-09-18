import { generateRandomNumbers } from '../helpers/numbers.js'
let verificationCodesDB = []

/**
 * Salva um novo código de verificação para um email.
 * Remove qualquer código antigo para o mesmo email antes de adicionar o novo.
 * @param {number} [timeout=5] - O tempo em minutos até o código expirar (padrão é 5 minutos).
 * @param {any} [id] - Parâmetro para identificar o código (Obrigatório)
 * @returns {Promise<{id: string, code: number, expiresAt: date}>} O registro do código que foi salvo.
 */
async function createVerificationCode(timeout = 5, id) {
  timeout = timeout ?? 5
  const uuid = crypto.randomUUID()
  verificationCodesDB = verificationCodesDB.filter((entry) => entry.id !== id)

  const expirationDate = new Date(Date.now() + timeout * 60 * 1000)

  const newCodeEntry = {
    id,
    uuid,
    code: generateRandomNumbers(),
    expiresAt: expirationDate,
  }

  const secureEntry = { ...newCodeEntry }
  delete secureEntry.uuid

  verificationCodesDB.push(newCodeEntry)
  return secureEntry
}

/**
 * Encontra e valida um código de verificação.
 * Se o código for válido e não estiver expirado, ele é removido para não ser usado novamente.
 * @param {any} id - identificação do código.
 * @param {string} code - O código que o usuário forneceu.
 * @returns {Promise<{valid: boolean, uuid: string, reason: string}>} Um objeto indicando se o código é válido.
 */
async function validateCodeAndGetUUID(id, code) {
  const foundEntry = verificationCodesDB.find((entry) => entry.id === id && entry.code === code)

  if (!foundEntry) {
    throw new Error('Código não encontrado ou inválido')
  }

  return {
    valid: true,
    uuid: foundEntry.uuid,
    reason: 'Código verificado com sucesso!',
  }
}

async function consumeVerificationUUID(uuid) {
  const foundEntry = verificationCodesDB.find((entry) => entry.uuid === uuid)

  if (!foundEntry) {
    throw new Error('Sessão não encontrada ou inválida')
  }

  if (new Date() > foundEntry.expiresAt) {
    // expirada → remove e lança erro
    verificationCodesDB = verificationCodesDB.filter((entry) => entry.uuid !== uuid)
    throw new Error('Sessão expirada')
  }

  // one-time use → remove depois de pegar
  verificationCodesDB = verificationCodesDB.filter((entry) => entry.uuid !== uuid)

  return foundEntry
}

export { createVerificationCode, validateCodeAndGetUUID, consumeVerificationUUID }
