import { getApiUrl } from './globalFunc';
import { useUserStore } from '@/stores/userData';

export async function isAuthenticated() {
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
      // logout();
      return false;
    }

  } catch (error) {
    console.error('Erro ao validar a sessão:', error);
    return false;
  }
}

async function handleUserData() {
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
  }
}
  
export async function logout() {
  await fetch(getApiUrl('database', '/logout'), { method: 'POST' });
  const userStore = useUserStore();
  userStore.clearUserData();
}

export function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}
