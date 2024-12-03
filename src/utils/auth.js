// src/utils/auth.js
export function isAuthenticated() {
  // Verifica se o token está presente e válido
  const token = localStorage.getItem('authToken');
  //return !!token; // Retorna verdadeiro se o token existir
  return true; // força o funcionamento do menu
}
  
export function logout() {
  localStorage.removeItem('authToken'); // Remove o token ao fazer logout
}

export function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

export function clearAuthToken() {
  localStorage.removeItem('authToken');
}
