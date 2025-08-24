import validator from 'validator'
import log from './console.js'

function setUserDatabaseQuery(...inputs) {
  try {
    return inputs.map((inputObj) => {
      let { value, keyName } = inputObj
      value = String(value).trim()

      if (validator.isNumeric(value) && Number.isInteger(Number(value))) {
        return { [keyName || 'id']: Number(value) }
      }

      if (validator.isEmail(value)) {
        return { [keyName || 'email']: value }
      }

      return { [keyName || 'username']: value }
    })
  } catch (error) {
    log.error('Erro na função setUserDatabaseQuery: ', error)
    return false
  }
}

export { setUserDatabaseQuery }
