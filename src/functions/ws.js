import { ref } from 'vue'

export default function useWebSocket(url) {
  // Estado da conexão
  const data = ref(null)
  /**
   * Controla o estado atual da conexão WebSocket.
   * O valor é reativo, encapsulado por um `ref` do Vue.
   * @type {import('vue').Ref<'CONNECTING' | 'OPEN' | 'CLOSED' | 'ERROR'>}
   */
  const status = ref('CLOSED')
  const ws = ref(null)

  let explicitClose = false // Flag para saber se fechamos a conexão de propósito

  // Função para conectar
  const connect = async () => {
    if (ws.value && status.value === 'OPEN') {
      console.log('WebSocket já está conectado.')
      return
    }

    console.log('Conectando ao WebSocket...')
    explicitClose = false
    status.value = 'CONNECTING'
    ws.value = new WebSocket(url)

    return new Promise((resolve, reject) => {
      ws.value.onopen = () => {
        console.log('WebSocket conectado com sucesso! ✅')
        status.value = 'OPEN'
        resolve()
      }

      ws.value.onmessage = (event) => {
        try {
          data.value = JSON.parse(event.data)
        } catch (e) {
          data.value = event.data
        }
      }

      ws.value.onclose = () => {
        console.log('WebSocket desconectado.')
        status.value = 'CLOSED'
        ws.value = null

        if (!explicitClose) {
          console.log('Tentando reconectar em 5 segundos...')
          setTimeout(() => connect(), 5000)
        }
      }

      ws.value.onerror = (error) => {
        console.error('Erro no WebSocket:', error)
        status.value = 'ERROR'
        reject(error)
      }
    })
  }

  // Função para enviar dados
  /**
   * Envia uma mensagem para o servidor WebSocket através de uma rota específica.
   * @param {string} event - A rota ou evento de destino no servidor.
   * @param {*} payload - A mensagem ou dados a serem enviados (pode ser qualquer tipo serializável).
   * @returns {object | null}
   */
  const send = ({ event, payload = {} }) => {
    if (ws.value && status.value === 'OPEN' && event) {
      const objectPayload = typeof payload === 'object' ? JSON.stringify(payload) : payload
      const dataToSend = { event, payload: objectPayload }
      return ws.value.send(JSON.stringify(dataToSend))
    } else {
      console.warn('Não é possível enviar mensagem. WebSocket não está conectado.')
      return null
    }
  }

  // Função para desconectar
  const disconnect = () => {
    if (ws.value) {
      console.log('Fechando conexão WebSocket...')
      explicitClose = true
      ws.value.close()
    }
  }

  // Retornamos o estado reativo e as funções de controle
  return {
    data, // A última mensagem recebida do servidor
    status, // O status atual da conexão (OPEN, CLOSED, etc)
    connect, // Função para iniciar a conexão
    send, // Função para enviar mensagens
    disconnect, // Função para fechar a conexão
  }
}
