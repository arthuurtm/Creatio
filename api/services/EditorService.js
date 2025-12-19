import FileService from './FileService.js'
import { validateGameOwnership } from './GameService.js'
import { gamePathGenerator } from '../helpers/query.js'

async function saveState({ id, version, state, accessToken }) {
  await validateGameOwnership(id, accessToken)
  const key = `game_${id}_editor`
  const fileName = `${gamePathGenerator(id, version)}/editor.json`
  const objectName = await FileService.write.queueSave(key, state, {
    bucket: 'private',
    meta: { 'Content-Type': 'application/json' },
    objectNameGenerator: () => fileName,
  })

  return objectName
}

/**
 * Recupera o estado do editor do storage.
 */
async function getState({ id, version, accessToken }) {
  await validateGameOwnership(id, accessToken)
  const fileName = `${gamePathGenerator(id, version)}/editor.json`
  const result = await FileService.read.readJson('private', fileName)
  return result
}

export default { saveState, getState }
