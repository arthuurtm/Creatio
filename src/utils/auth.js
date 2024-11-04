// src/utils/auth.js
export function isAuthenticated() {
    // Verifica se o token está presente e válido
    const token = localStorage.getItem('authToken');
    return !!token; // Retorna verdadeiro se o token existir
  }
  
  export function logout() {
    localStorage.removeItem('authToken'); // Remove o token ao fazer logout
  }
  