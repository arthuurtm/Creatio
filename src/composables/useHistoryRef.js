import { reactive, watch, computed } from 'vue'

/**
 * Hook para gerenciar as operações de Desfazer/Refazer (Undo/Redo)
 * @param {object} targetState - O objeto de estado reativo a ser gerenciado (ex: editorStore.$getState ou a store inteira)
 * @param {string[]} keysToSnapshot - Array de chaves (propriedades) do estado que devem ser salvas no histórico.
 */
export function useUndoRedo(targetState, keysToSnapshot) {
  const undoStack = reactive([])
  const redoStack = reactive([])

  const createSnapshot = () => {
    const snapshot = {}
    for (const key of keysToSnapshot) {
      // Cria cópia profunda apenas das chaves relevantes
      snapshot[key] = JSON.parse(JSON.stringify(targetState[key]))
    }
    return snapshot
  }

  // Função que aplica um snapshot ao estado reativo
  const applySnapshot = (snapshot) => {
    for (const key of keysToSnapshot) {
      if (Array.isArray(targetState[key]) && Array.isArray(snapshot[key])) {
        targetState[key].splice(0, targetState[key].length, ...snapshot[key])
      } else {
        targetState[key] = snapshot[key]
      }
    }
  }

  const commitState = () => {
    const snapshot = createSnapshot()
    undoStack.push(snapshot)
    redoStack.length = 0
  }

  const undo = () => {
    if (undoStack.length <= 1) return

    // 1. Salva o estado atual para a pilha de redo
    redoStack.push(createSnapshot())

    // 2. Remove o estado atual da pilha de undo e pega o anterior
    undoStack.pop()
    const prev = undoStack[undoStack.length - 1]

    // 3. Aplica o estado anterior
    applySnapshot(prev)
  }

  const redo = () => {
    if (!redoStack.length) return

    // 1. Pega o próximo estado
    const next = redoStack.pop()

    // 2. Salva o estado atual na pilha de undo (para que se possa desfazer novamente)
    undoStack.push(createSnapshot())

    // 3. Aplica o próximo estado
    applySnapshot(next)
  }

  // Opcional: Adiciona um watcher para fazer o commit automaticamente quando o estado muda
  watch(
    () => keysToSnapshot.map((key) => targetState[key]),
    // Opcional: Você pode adicionar um debounce aqui para não salvar a cada movimento
    () => {
      // Garante que o primeiro estado seja sempre o inicial
      if (undoStack.length === 0) {
        commitState()
      }
      commitState()
    },
    { deep: true, immediate: true }, // immediate para salvar o estado inicial
  )

  return {
    undo,
    redo,
    commitState,
    canUndo: computed(() => undoStack.length > 1),
    canRedo: computed(() => redoStack.length > 0),
  }
}
