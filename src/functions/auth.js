import { get, post, del } from './functions'
import { useUserStore } from '@/stores/store'

async function handleUserData() {
  try {
    const res = await get({ type: 'database', route: 'getUserBasics' })

    if (res) {
      useUserStore().setUserData({
        id: res.id,
        name: res.nickname,
        username: res.username,
        email: res.email,
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

    if (!res.ok) {
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

    if (!res.ok) {
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
  await del({ type: 'database', route: 'logout' })
  useUserStore().clearUserData()
}
