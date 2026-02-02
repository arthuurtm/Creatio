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

function deepFindById(data, id) {
  if (Array.isArray(data)) {
    for (const item of data) {
      const result = deepFindById(item, id)
      if (result) return result
    }
  } else if (data && typeof data === 'object') {
    if (data.id === id) return data
    for (const key in data) {
      const result = deepFindById(data[key], id)
      if (result) return result
    }
  }
  return null
}

export default { handleImage, selectFile, deepFindById }
