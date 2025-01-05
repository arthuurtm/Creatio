import { getCompleteUrl } from './globalFunc';

export async function isAuthenticated() {
  const token = localStorage.getItem('authToken');

  if (!token) {
    console.warn('Token não encontrado. Usuário não está autenticado.');
    return false;
  }

  try {
    // Envia o token para validação na API
    const response = await fetch(getCompleteUrl(window.location.host, 3000, 'validate-user-session'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sessionId: token,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Sessão válida:', data);
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
  
export function logout() {
  localStorage.removeItem('authToken');
}

export function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}
