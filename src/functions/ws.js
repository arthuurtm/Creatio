import { ref, watch } from 'vue'

export default function useWebSocket(url) {
  // Estado da conexão
  const data = ref(null)
  const status = ref('CLOSED') // Pode ser: CONNECTING, OPEN, CLOSED, ERROR
  const ws = ref(null)

  let explicitClose = false // Flag para saber se fechamos a conexão de propósito

  // Função para conectar
  const connect = () => {
    if (ws.value && status.value === 'OPEN') {
      console.log('WebSocket já está conectado.')
      return
    }

    console.log('Conectando ao WebSocket...')
    explicitClose = false
    status.value = 'CONNECTING'
    ws.value = new WebSocket(url)

    ws.value.onopen = () => {
      console.log('WebSocket conectado com sucesso! ✅')
      status.value = 'OPEN'
    }

    ws.value.onmessage = (event) => {
      try {
        // Tentamos fazer o parse do dado, assumindo que é um JSON
        data.value = JSON.parse(event.data)
      } catch (e) {
        // Se não for JSON, usamos o dado bruto
        data.value = event.data
      }
    }

    ws.value.onclose = () => {
      console.log('WebSocket desconectado.')
      status.value = 'CLOSED'
      ws.value = null

      // Tenta reconectar se não foi um fechamento explícito
      if (!explicitClose) {
        console.log('Tentando reconectar em 5 segundos...')
        setTimeout(() => connect(), 5000)
      }
    }

    ws.value.onerror = (error) => {
      console.error('Erro no WebSocket:', error)
      status.value = 'ERROR'
    }
  }

  // Função para enviar dados
  const send = (message) => {
    if (ws.value && status.value === 'OPEN') {
      // Converte para string JSON se for um objeto
      const dataToSend = typeof message === 'object' ? JSON.stringify(message) : message
      ws.value.send(dataToSend)
    } else {
      console.warn('Não é possível enviar mensagem. WebSocket não está conectado.')
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
