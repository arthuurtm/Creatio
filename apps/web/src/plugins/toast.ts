export function showToast ({ type = 'default', message = '', timeout = 3000 }) {
  console.log('Exibindo toast:', { type, message, timeout })
  
  // Unified Naive UI message service routing
  const msgService = (window as any).$message
  if (msgService) {
    const naiveType = type === 'default' ? 'info' : type
    if (typeof msgService[naiveType] === 'function') {
      msgService[naiveType](message, { duration: timeout })
      return
    }
  }

  console.warn('Naive UI global message service not loaded yet. Message:', message)
}
