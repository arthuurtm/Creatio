import { get, post, del } from '.'
import { showToast } from '@/plugins/toast'
import { useUserStore } from '@/stores/user'

async function handleUserData() {
  try {
    const res = await get({ type: 'database', route: 'getUserData' })

    if (res.details) {
      useUserStore().setUserData({
        id: res.details.id,
        name: res.details.nickname,
        username: res.details.username,
        email: res.details.email,
        profilePicture: null,
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

export async function isAuthenticated() {
  return handleUserData()
}

export async function logout() {
  const res = await del({ type: 'database', route: 'logout' })
  if (res.okay) {
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

export async function logoutAll() {
  del({ type: 'database', route: 'logoutAll' }).then((result) => {
    if (result.okay) {
      showToast({
        type: 'success',
        message: 'Você saiu de todas as outras sessões!',
      })
      return true
    }
    return
  })
}
