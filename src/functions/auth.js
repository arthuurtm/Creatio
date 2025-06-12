import { get, post, del } from './functions'
import { showToast } from '@/plugins/toast'
import { useUserStore } from '@/stores/user'

async function handleUserData() {
  try {
    const res = await get({ type: 'database', route: 'getUserBasics' })

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
    useUserStore().clearUserData() // Garante o logout em caso de erro
    return false
  }
}

async function handleAuthentication() {
  try {
    const res = await get({ type: 'database', route: 'getUserSession' })

    if (!res.okay) {
      return await handleRefreshToken()
    }
    const userDataLoaded = await handleUserData()

    // Atualiza o estado de autenticação baseado no resultado
    useUserStore().isAuth = userDataLoaded
    return userDataLoaded
  } catch (error) {
    console.error('Erro ao validar a sessão:', error)
    useUserStore().isAuth = false
    return false
  }
}

async function handleRefreshToken() {
  try {
    const res = await post({ type: 'database', route: 'refreshToken' })

    if (!res.okay) {
      await logout()
      return false
    }

    const userDataLoaded = await handleUserData()

    useUserStore().isAuth = userDataLoaded
    return userDataLoaded
  } catch (error) {
    console.error('Erro ao renovar token:', error)
    await logout()
    return false
  }
}

export async function isAuthenticated() {
  return handleAuthentication()
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
