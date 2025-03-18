export function validateFields(fields, formData) {
  let errors = {}

  fields.forEach((field) => {
    if (field.required && !formData[field.model]) {
      errors[field.model] = `${field.label} é obrigatório`
    }
  })

  return errors
}
