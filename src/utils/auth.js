import { getApiUrl } from './functions';
import { useUserStore } from '@/stores/userData';

async function handleUserData() {
  try {

    const res = await fetch(getApiUrl('database', 'check-user'), {
      credentials: 'include', method: 'POST', headers: { 'Content-Type': 'application/json' },
    });
  
    const data = await res.json();

    if (data) {
      useUserStore().setUserData({ 
        id: data.id,
        name: data.nickname,
        username: data.username,
        email: data.email,
        profilePicture: null 
      });
      return true;
    } else {
      console.error(`Erro ao recuperar dados: ${data.message}`);
      return false
    }

  } catch (error) {
    console.error(`Erro ao recuperar dados: ${error}`);
    return false;
  }
}

async function handleAuthentication() {
  try {

    const res = await fetch(getApiUrl('database', 'validate-user-session'), {
      credentials: 'include', method: 'POST', headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (res.ok) {
      console.log('Sessão válida:', data);
      handleUserData();
      return true;
    } else {
      console.warn('Sessão inválida:', data.message);
      logout();
      return false;
    }

  } catch (error) {
    console.error('Erro ao validar a sessão:', error);
    return false;
  }
}

export async function isAuthenticated() {
  return handleAuthentication();
}
  
export async function logout() {
  await fetch(getApiUrl('database', 'logout'), { method: 'POST' });
  const userStore = useUserStore();
  userStore.clearUserData();
}