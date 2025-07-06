function getApiUrl(type, route) {
  const origin = window.location.origin
  if (!type || !route) {
    console.error('Tipo ou rota não fornecidos.')
    return null
  }
  return `${origin}/api/${type}/${route}`
}

export function appTheme(toggle = false, glassy = false) {
  const savedTheme = localStorage.getItem('data-theme')
  let themeModifier = localStorage.getItem('data-modifier')
  let currentTheme

  if (savedTheme) {
    currentTheme = savedTheme
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    currentTheme = prefersDark ? 'dark' : 'light'
    localStorage.setItem('data-theme', currentTheme)
  }

  if (glassy) {
    themeModifier = themeModifier === 'glass' ? 'default' : 'glass'
    localStorage.setItem('data-modifier', themeModifier)
  }

  if (toggle) {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('data-theme', currentTheme)
  }

  document.documentElement.setAttribute('data-theme', currentTheme)
  document.documentElement.setAttribute('data-modifier', themeModifier || 'default')

  return {
    currentTheme: currentTheme,
    isDark: currentTheme === 'dark' ? true : false,
    isGlassy: themeModifier === 'glass' ? true : false,
  }
}

class FormError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = ''
    this.okay = false
    this.details = details
  }
}

const request = async (endpoint = {}, method = 'GET', body = null) => {
  const getHttpStatusMessage = (status) => {
    const messages = {
      400: 'Requisição inválida',
      401: 'Não autorizado',
      403: 'Proibido',
      404: 'Não encontrado',
      500: 'Erro interno do servidor',
      503: 'Serviço indisponível',
    }
    return messages[status] || 'Erro desconhecido'
  }

  const isFormData = body instanceof FormData

  const config = {
    credentials: 'include',
    method,
    headers: isFormData
      ? undefined
      : {
          'Content-Type': endpoint.contentType || 'application/json',
        },
    body: isFormData ? body : body ? JSON.stringify(body) : null,
  }

  try {
    const response = await fetch(getApiUrl(endpoint.type, endpoint.route), config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const serverMessage = errorData.message || `Erro ${response.status} na requisição`
      throw new FormError(serverMessage, errorData.details)
    }

    const res = response ? await response.json() : {}

    console.log(`Requisição para ${endpoint.route} efetuada com sucesso. `, res)

    return { details: res, okay: true }
  } catch (error) {
    console.error(`Erro na requisição para ${endpoint.route}:`, {
      endpoint: endpoint.route,
      method: config?.method || 'GET',
      error: error.message,
      details: error.details || error,
    })

    if (error instanceof FormError) {
      throw error
    }
  }
}

export const get = (endpoint) => request(endpoint, 'GET')
export const post = (endpoint, body) => request(endpoint, 'POST', body)
export const put = (endpoint, body) => request(endpoint, 'PUT', body)
export const del = (endpoint) => request(endpoint, 'DELETE')
