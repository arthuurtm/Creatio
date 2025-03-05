import { getApiUrl } from './functions';
import { useUserStore } from '@/stores/userStore';

async function handleUserData() {
	try {

		const res = await fetch(getApiUrl('database', 'getUserBasics'), {
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
	  const res = await fetch(getApiUrl('database', 'getUserSession'), {
		credentials: 'include', method: 'POST', headers: { 'Content-Type': 'application/json' },
	  });
  
	  const data = await res.json();
  
	  if (res.ok) {
		console.log('Sessão válida:', data);
		handleUserData();
		return true;
	  } else {
		console.warn('Sessão inválida:', data.message);
		const result = await handleRefreshToken(); // Corrigido aqui para declarar a variável
		return result;  // Se for true, retorna true, caso contrário, retorna false
	  }
	} catch (error) {
	  console.error('Erro ao validar a sessão:', error);
	  return false;
	}
  }
  

async function handleRefreshToken() {
	try {
		const res = await fetch(getApiUrl('database', 'refreshToken'), {
			credentials: 'include', method: 'POST', headers: { 'Content-Type': 'application/json' },
		});

		const data = await res.json();

		if (res.ok) {
			console.log('Sessão recuperada: ', data.message);
			return true;
		} else {
			console.warn('Erro ao recuperar sessão: ', data.message);
			logout();
			return false;
		}
	} catch(error) {
		console.error('Erro ao processar função handleRefreshToken');
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