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

/**
 *
 * @param {string} type
 * @returns {Promise<{file: File, url: string}>}
 */
const selectFile = (type) => {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = type || 'all/*'
    input.style.display = 'none'

    input.onchange = (event) => {
      const file = event.target.files[0]
      if (file) {
        const url = URL.createObjectURL(file) // gera URL temporária
        resolve({ file, url })
      } else {
        resolve(null)
      }
    }

    document.body.appendChild(input)
    input.click()

    // remove depois
    input.addEventListener('blur', () => {
      document.body.removeChild(input)
    })
  })
}

export default { appTheme, handleImage, selectFile }
