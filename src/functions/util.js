function appTheme(toggle = false, glassy = false) {
  const savedTheme = localStorage.getItem('data-theme')
  let themeModifier = localStorage.getItem('data-modifier')
  let currentTheme

  if (savedTheme) {
    currentTheme = savedTheme
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    currentTheme = prefersDark ? 'dark' : 'light'
    localStorage.setItem('data-theme', currentTheme)
  }

  if (glassy) {
    themeModifier = themeModifier === 'glass' ? 'default' : 'glass'
    localStorage.setItem('data-modifier', themeModifier)
  }

  if (toggle) {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('data-theme', currentTheme)
  }

  document.documentElement.setAttribute('data-theme', currentTheme)
  document.documentElement.setAttribute('data-modifier', themeModifier || 'default')

  return {
    currentTheme: currentTheme,
    isDark: currentTheme === 'dark' ? true : false,
    isGlassy: themeModifier === 'glass' ? true : false,
  }
}

function handleImage(file, isPublic = true) {
  if (file instanceof File || file instanceof Blob) {
    return URL.createObjectURL(file)
  }

  if (typeof file === 'string') {
    if (file.startsWith('http://') || file.startsWith('https://')) {
      return file
    }
    if (isPublic) {
      // return getApiUrl('file', `public/${file}`)
    }
  }

  return null
}

export default { appTheme, handleImage }
