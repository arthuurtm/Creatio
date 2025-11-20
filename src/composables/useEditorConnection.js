import { watch } from 'vue'
import { ws, http } from '@/functions'
import { useEditorStore } from '@/stores/editor'
import { useSyncProtection } from '@/composables/useSyncProtection'

export function useEditorConnection() {
  const store = useEditorStore()
  const base = store
  const { isLocalStateNewer } = useSyncProtection(base.$state)

  const { data, status, connect, send, disconnect } = ws(http.getApiUrl('ws'))

  async function start() {
    await connect()
  }

  function stop() {
    disconnect()
  }

  // Recebe do servidor
  watch(data, (msg) => {
    if (!msg || !msg.event) return

    if (msg.event === 'game:lab:get:json:success') {
      if (!isLocalStateNewer(msg.data, store.$properties())) {
        store.$setState(msg.payload)
      }
    }
  })

  // Envia quando algo muda
  // watch(
  //   base.$state,
  //   () => {
  //     if (status.value === 'OPEN') {
  //       const payload = { state: base.$rawState(), ...base.info }
  //       send({ event: 'game:lab:update:json', payload })
  //     }
  //   },
  //   { deep: true },
  // )

  return { start, stop, requestStatus: status, send, data }
}
