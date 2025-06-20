import { useToast } from 'vue-toastification'

const toast = useToast()

export function showToast({ type = 'default', message = '', timeout = 3000 }) {
  console.log('Exibindo toast:', { type, message, timeout })
  const validTypes = ['success', 'error', 'info', 'warning', 'default']

  try {
    if (validTypes.includes(type) && typeof toast[type] === 'function') {
      toast[type](message, {
        timeout,
        position: 'top-center',
      })
    } else {
      toast.info(message || 'Notificação!', {
        timeout,
        position: 'top-center',
      })
    }
  } catch (error) {
    console.error('Erro ao exibir toast:', error)
  }
}
