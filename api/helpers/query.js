import validator from 'validator'

export function checkIfUserIsValid(input) {
  try {
    const isEmail = validator.isEmail(input)
    const query = isEmail ? { email: input } : { username: input }
    console.log('checkIfUserIsValid.query = ', query)
    return query
  } catch (error) {
    console.error('Erro ao processar função checkIfUserIsValid: ', error)
    return false
  }
}
