export function getApiUrl(type, route) {
  const origin = window.location.origin
  if (!type || !route) {
    console.error('Tipo ou rota não fornecidos.')
    return null
  }
  switch (type) {
    case 'database':
      return `${origin}/api/database/${route}`
    case 'email':
      return `${origin}/api/email/${route}`
    case 'gameData':
      return `${origin}/api/gameData/${route}`
    default:
      return null
  }
}

export function hrefTo(url, args = {}) {
  const queryString = new URLSearchParams(args).toString()
  const finalUrl = queryString ? `${url}?${queryString}` : url
  window.location.href = finalUrl
}

export function appTheme(toggle = false) {
  // Obter tema salvo no localStorage
  const savedTheme = localStorage.getItem('data-theme')
  console.log('data-theme', localStorage.getItem('data-theme'))
  let currentTheme
  let isDark

  if (savedTheme) {
    // Respeita o tema salvo
    currentTheme = savedTheme
  } else {
    // Usa a preferência do sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    currentTheme = prefersDark ? 'dark' : 'light'
    // Salva o tema inicial no localStorage
    localStorage.setItem('data-theme', currentTheme)
  }

  // Alternar o tema se toggle for verdadeiro
  if (toggle) {
    console.log('toggle theme: ', currentTheme)
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('data-theme', currentTheme)
  }

  currentTheme === 'dark' ? (isDark = true) : (isDark = false)

  // Aplicar o tema atual
  document.documentElement.setAttribute('data-theme', currentTheme)

  return {
    currentTheme: currentTheme,
    isDark: isDark,
  }
}
