import { ref, shallowRef, onUnmounted } from 'vue'

/**
 * Composable para gerenciar uma conexão WebSocket com reconexão automática e gerenciamento de ciclo de vida.
 * * @param {string} url O URL do servidor WebSocket.
 * @param {object} [options] Opções de configuração.
 * @param {boolean} [options.autoReconnect=true] Habilita a reconexão automática.
 * @param {number} [options.reconnectLimit=5] Número máximo de tentativas de reconexão. Use Infinity para tentativas ilimitadas.
 * @param {number} [options.reconnectInterval=2000] Intervalo inicial de reconexão em milissegundos.
 * @param {number} [options.maxReconnectInterval=30000] Intervalo máximo de reconexão (teto do backoff exponencial).
 */
export default function useWebSocket(url, options = {}) {
  const {
    autoReconnect = true,
    reconnectLimit = 5,
    reconnectInterval = 2000,
    maxReconnectInterval = 30000,
  } = options

  // --- Estado Reativo ---
  const data = ref(null)
  /** @type {import('vue').Ref<"CONNECTING" | "OPEN" | "CLOSING" | "CLOSED" | "RECONNECTING">} */
  const status = ref('CLOSED')
  const ws = shallowRef(null)
  const error = ref(null)
  const retryCount = ref(0)
  let explicitClose = false
  let reconnectTimer = null

  const _setupEventListeners = () => {
    if (!ws.value) return

    ws.value.onopen = () => {
      console.log('WebSocket conectado com sucesso! ✅')
      status.value = 'OPEN'
      error.value = null
      retryCount.value = 0 // Reseta o contador ao conectar
    }

    ws.value.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        data.value = message
        if (message.event && (message.event === 'error' || message.event.endsWith(':error'))) {
          console.error(
            `Erro reportado pelo servidor (${message.event}):`,
            message.data?.message || 'Nenhuma mensagem de erro provida.',
          )
          error.value = new Error(
            `Server error on event ${message.event}: ${message.data?.message}`,
          )
        }
        console.log(`Requisição para ${message.event} efetuada com sucesso.`, message)
      } catch (err) {
        console.error('Erro ao processar mensagem (JSON inválido):', event.data, err)
        error.value = err
      }
    }

    ws.value.onerror = (e) => {
      console.error('Erro no WebSocket:', e)
      error.value = e
    }

    ws.value.onclose = (e) => {
      ws.value = null

      if (explicitClose) {
        console.log('Conexão WebSocket fechada intencionalmente.')
        status.value = 'CLOSED'
      } else {
        console.warn(`WebSocket desconectado. Código: ${e.code}. Motivo: ${e.reason || 'N/A'}`)
        if (autoReconnect && retryCount.value < reconnectLimit) {
          _reconnect()
        } else {
          status.value = 'CLOSED'
          if (autoReconnect) {
            console.error('Limite de tentativas de reconexão atingido.')
          }
        }
      }
    }
  }

  const _reconnect = () => {
    status.value = 'RECONNECTING'
    retryCount.value++

    // Exponential backoff com um "jitter" (fator aleatório) para evitar picos de reconexão
    const delay =
      Math.min(reconnectInterval * Math.pow(2, retryCount.value - 1), maxReconnectInterval) *
      (Math.random() * 0.2 + 0.9) // jitter de 90% a 110% do delay

    console.log(
      `Tentando reconectar em ${Math.round(delay / 1000)}s... (Tentativa ${retryCount.value})`,
    )

    reconnectTimer = setTimeout(() => {
      connect()
    }, delay)
  }

  /** Inicia a conexão WebSocket. */
  const connect = async () => {
    // Evita múltiplas conexões
    if (ws.value || status.value === 'CONNECTING' || status.value === 'RECONNECTING') {
      console.warn('Conexão WebSocket já em andamento.')
      return
    }

    console.log('Conectando ao WebSocket...')
    status.value = 'CONNECTING'
    explicitClose = false
    error.value = null

    try {
      ws.value = new WebSocket(url)
      _setupEventListeners()
    } catch (e) {
      console.error('Falha ao criar instância do WebSocket:', e)
      error.value = e
      status.value = 'CLOSED'
    }
  }

  /**
   * Envia uma mensagem para o servidor WebSocket.
   * @param {object} message - O objeto a ser enviado.
   * @param {string} message.event - O evento/rota de destino no servidor.
   * @param {*} [message.payload={}] - Os dados a serem enviados.
   */
  const send = ({ event, payload = {} }) => {
    if (ws.value && status.value === 'OPEN' && event) {
      try {
        const dataToSend = JSON.stringify({ event, payload })
        ws.value.send(dataToSend)
      } catch (e) {
        console.error('Falha ao enviar mensagem:', e)
        error.value = e
      }
    } else {
      console.warn('Não foi possível enviar a mensagem. WebSocket não está aberto.', {
        status: status.value,
      })
    }
  }

  /** Fecha a conexão WebSocket intencionalmente. */
  const disconnect = () => {
    if (ws.value) {
      console.log('Fechando conexão WebSocket...')
      explicitClose = true
      status.value = 'CLOSING'
      clearTimeout(reconnectTimer) // Cancela qualquer reconexão pendente
      ws.value.close(1000, 'Fechamento intencional pelo cliente.')
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    data,
    status,
    error,
    retryCount,
    connect,
    send,
    disconnect,
    ws,
  }
}
