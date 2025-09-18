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

    // fallback: usa posição do node, se existir
    const node = editorStore.nodes.find((n) => n.id === nodeId)
    if (!node) return null
    return { x: node.x + 140, y: node.y + 40 }
  }

  function handleStartConnection({ nodeId, socketId }) {
    const from = `${nodeId}:${socketId}`
    const startPos = getPortPosition(nodeId, socketId)
    if (!startPos) return

    tempConnection.value = { from, x: startPos.x, y: startPos.y }

    function onMouseMove(e) {
      const svgRect = document.querySelector('.connections-layer').getBoundingClientRect()
      tempConnection.value.x = e.clientX - svgRect.left
      tempConnection.value.y = e.clientY - svgRect.top
    }

    function onMouseUp(e) {
      const target = e.target.closest('.dot')
      if (target) {
        const to = target.dataset.port
        if (to && to !== tempConnection.value.from) {
          editorStore.connections.push({ from: tempConnection.value.from, to })
        }
      }
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

    const tempPath = tempConnection.value
      ? buildTempPath(tempConnection.value.from, {
          x: tempConnection.value.x,
          y: tempConnection.value.y,
        })
      : null
    if (tempPath) realPaths.push(tempPath)

    return realPaths
  })

  return { handleStartConnection, paths, forceUpdatePaths }
}
