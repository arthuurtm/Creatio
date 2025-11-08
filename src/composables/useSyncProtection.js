/**
 * Helper para obter o timestamp mais recente em uma coleção de objetos.
 * Assume que os objetos no array possuem a propriedade 'updatedAt'.
 * @param {Array<Object>} arr O array de objetos a ser verificado.
 * @returns {number} O timestamp (número) mais alto encontrado, ou 0.
 */
const getLatestTimestamp = (arr) =>
  arr && arr.length ? Math.max(...arr.map((item) => item.updatedAt || 0)) : 0

/**
 * Hook para gerenciar a proteção contra sobrescrita de estado.
 * @param {object} localState O objeto de estado reativo local (ex: editorStore)
 */
export function useSyncProtection(localState) {
  /**
   * Compara o timestamp do estado local com o estado remoto para as chaves especificadas.
   *
   * @param {object} remoteState O objeto de estado completo recebido do servidor.
   * @param {string[]} keysToCheck Um array com os nomes das chaves (propriedades) a serem comparadas.
   * @returns {boolean} Retorna TRUE se o estado local for mais novo e NÃO deve ser sobrescrito.
   */
  const isLocalStateNewer = (remoteState, keysToCheck) => {
    let isLocalNewer = false

    for (const key of keysToCheck) {
      const localTs = getLatestTimestamp(localState[key])
      const remoteTs = getLatestTimestamp(remoteState[key])

      if (localTs > remoteTs) {
        // Se qualquer chave local for mais nova que a remota, a proteção é acionada.
        isLocalNewer = true
        break
      }
    }

    return isLocalNewer
  }

  return {
    isLocalStateNewer,
  }
}
