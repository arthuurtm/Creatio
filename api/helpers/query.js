import validator from 'validator'

function setUserDatabaseQuery(input) {
  try {
    if (validator.isNumeric(input) && Number.isInteger(Number(input))) {
      const query = { id: Number(input) }
      console.log('checkIfUserIsValid.query = ', query)
      return query
    }
    const isEmail = validator.isEmail(input)
    const query = isEmail ? { email: input } : { username: input }
    console.log('checkIfUserIsValid.query = ', query)
    return query
  } catch (error) {
    console.error('Erro ao processar função checkIfUserIsValid: ', error)
    return false
  }
}

export { setUserDatabaseQuery }
