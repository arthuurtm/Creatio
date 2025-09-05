import { showToast } from '@/plugins/toast'
import { useUserStore } from '@/stores/user'
import { debounce } from 'lodash-es'

class FormError extends Error {
  constructor(message, details = {}) {
    super(message)
    Object.assign(this, { ...details })
  }
}

function getApiUrl(type, route, querys = null) {
  const origin = window.location.origin
  const handleRoute = {
    ws: () => {
      return `${origin.replace(/^(https?:\/\/)/, 'ws://')}/ws`
    },
    default: () => {
      return `${origin}/api/${type}/${route}`
    },
  }
  if (type != 'ws' && (!type || !route)) {
    console.error('Tipo ou rota não fornecidos.')
    return null
  }
  let url = (handleRoute[type] || handleRoute.default)()
  if (querys) {
    const queryString = buildQuery(querys)
    url += `?${queryString}`
  }
  return url
}

function buildQuery(params = {}) {
  if (!params) {
    return ''
  }
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // envia array como ?tags=a&tags=b&tags=c
      value.forEach((v) => query.append(key, v))
    } else if (typeof value === 'object' && value !== null) {
      // envia objeto como JSON string
      query.append(key, JSON.stringify(value))
    } else if (value !== undefined && value !== null) {
      query.append(key, value)
    }
  })

  return query.toString()
}

const request = async (endpoint = {}, method = 'GET', body = null) => {
  const getHttpStatusMessage = (status) => {
    const messages = {
      400: 'A requisição não pôde ser processada. Tente novamente.',
      401: 'Sua sessão expirou ou você não está autenticado.',
      403: 'Você não tem permissão para acessar este recurso.',
      404: 'O recurso solicitado não foi encontrado.',
      500: 'Estamos enfrentando um problema no servidor. Tente novamente mais tarde.',
      503: 'O serviço está temporariamente indisponível. Por favor, tente mais tarde.',
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
    const response = await fetch(getApiUrl(endpoint.type, endpoint.route, endpoint.querys), config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const serverMessage = errorData.message || getHttpStatusMessage(response.status)
      throw new FormError(serverMessage, { ...errorData, status: response.status })
    }

    const res = response ? await response.json() : {}

    console.log(`Requisição para ${endpoint.route} efetuada com sucesso. `, res)

    return { ...res }
  } catch (error) {
    console.error(`Erro na requisição para ${endpoint.route}:`, {
      endpoint: endpoint.route,
      method: config?.method || 'GET',
      error: error.message,
      details: error,
    })

    if (error instanceof FormError) {
      throw error
    }
  }
}
const get = (endpoint) => request(endpoint, 'GET')
const post = (endpoint, body) => request(endpoint, 'POST', body)
const put = (endpoint, body) => request(endpoint, 'PUT', body)
const del = (endpoint) => request(endpoint, 'DELETE')
get.slow = debounce((endpoint) => request(endpoint, 'GET'), 500)

async function handleUserData() {
  try {
    const res = await get({ type: 'database', route: 'getUserData' })

    if (res) {
      useUserStore().setUserData({
        id: res.id,
        name: res.nickname,
        username: res.username,
        email: res.email,
        profilePicture: res.profilePic,
      })
      return true
    }
    throw new Error(res.message || 'Dados do usuário não encontrados')
  } catch (error) {
    console.error(`Erro ao recuperar dados: ${error}`)
    useUserStore().clearUserData()
    return false
  }
}
async function isAuthenticated() {
  return handleUserData()
}
async function logout() {
  const res = await del({ type: 'database', route: 'logout' })
  if (res) {
    useUserStore().clearUserData()
    showToast({
      type: 'success',
      message: 'Você saiu da sua conta!',
    })
    return
  } else {
    showToast({
      type: 'error',
      message: res.message || 'Erro interno no servidor',
    })
  }
}
async function logoutAll() {
  del({ type: 'database', route: 'logoutAll' }).then((result) => {
    if (result) {
      showToast({
        type: 'success',
        message: 'Você saiu de todas as outras sessões!',
      })
      return true
    }
    return
  })
}
const auth = { isAuthenticated, logout, logoutAll }

export default { get, post, put, del, getApiUrl, auth }
