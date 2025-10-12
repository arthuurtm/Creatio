import { ref, computed, watch } from 'vue'

export function useConnections(editorStore) {
  const tempConnection = ref(null)
  const nodesTrigger = ref(0)
  watch(
    () => editorStore.nodes.map((n) => ({ x: n.x, y: n.y })),
    () => {
      nodesTrigger.value++
    },
    { deep: true },
  )

  function forceUpdatePaths() {
    nodesTrigger.value++
  }

  function getPortPosition(nodeId, port) {
    const selector = `[data-port="${nodeId}:${port}"]`
    const el = document.querySelector(selector)
    if (el) {
      const rect = el.getBoundingClientRect()
      const svgRect = document.querySelector('.connections-layer').getBoundingClientRect()
      return {
        x: rect.left + rect.width / 2 - svgRect.left,
        y: rect.top + rect.height / 2 - svgRect.top,
      }
    }

    const node = editorStore.nodes.find((n) => n.id === nodeId)
    if (!node) return null
    return { x: node.x + 140, y: node.y + 40 }
  }

  function handleStartConnection({ nodeId, socketId }) {
    // guard: não iniciar outro drag se já existe um
    if (tempConnection.value) return

    const from = `${nodeId}:${socketId}`
    const startPos = getPortPosition(nodeId, socketId)
    if (!startPos) return

    tempConnection.value = { from, x: startPos.x, y: startPos.y }

    const onMouseMove = (e) => {
      const svgRect = document.querySelector('.connections-layer').getBoundingClientRect()
      tempConnection.value.x = e.clientX - svgRect.left
      tempConnection.value.y = e.clientY - svgRect.top
    }

    function onMouseUp(e) {
      const els = document.elementsFromPoint(e.clientX, e.clientY) || []
      const dot = els.find((el) => el.dataset && el.dataset.port)
      const to = dot?.dataset?.port

      if (to && to !== tempConnection.value.from) {
        const from = tempConnection.value.from

        const fromNode = normalizeNode(from)
        const toNode = normalizeNode(to)

        // não permitir loop para o mesmo node
        if (fromNode === toNode) return cleanup()

        const alreadyExists = editorStore.connections.some((c) => {
          const cFrom = normalizeNode(c.from)
          const cTo = normalizeNode(c.to)
          return (cFrom === fromNode && cTo === toNode) || (cFrom === toNode && cTo === fromNode)
        })

        if (!alreadyExists) {
          editorStore.connections.push({ from, to })
        } else {
          console.debug('Conexão já existe entre', fromNode, 'e', toNode)
        }
      }

      cleanup()
    }

    function normalizeNode(portStr) {
      return String(portStr).split(':')[0]
    }

    function cleanup() {
      tempConnection.value = null
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function buildPath(from, to) {
    if (!from || !to) return null
    const [fromNodeId, fromPort] = from.split(':')
    const [toNodeId, toPort] = to.split(':')
    const fromPos = getPortPosition(fromNodeId, fromPort)
    const toPos = getPortPosition(toNodeId, toPort)
    if (!fromPos || !toPos) return null

    const dx = (toPos.x - fromPos.x) / 2
    const d = `M ${fromPos.x} ${fromPos.y}
               C ${fromPos.x + dx} ${fromPos.y},
                 ${toPos.x - dx} ${toPos.y},
                 ${toPos.x} ${toPos.y}`
    return { id: from + '_' + to, d }
  }

  function buildTempPath(temp) {
    if (!temp) return null
    const [fromNodeId, fromPort] = temp.from.split(':')
    const fromPos = getPortPosition(fromNodeId, fromPort)
    if (!fromPos) return null

    const dx = (temp.x - fromPos.x) / 2
    const d = `M ${fromPos.x} ${fromPos.y}
               C ${fromPos.x + dx} ${fromPos.y},
                 ${temp.x - dx} ${temp.y},
                 ${temp.x} ${temp.y}`
    return { id: 'temp', d }
  }

  const paths = computed(() => {
    nodesTrigger.value
    const realPaths = (editorStore.connections || [])
      .map((conn) => {
        if (!conn || !conn.from || !conn.to) return null
        return buildPath(conn.from, conn.to)
      })
      .filter(Boolean)

    const tempPath = tempConnection.value ? buildTempPath(tempConnection.value) : null
    if (tempPath) realPaths.push(tempPath)

    return realPaths
  })

  return { handleStartConnection, paths, forceUpdatePaths }
}
