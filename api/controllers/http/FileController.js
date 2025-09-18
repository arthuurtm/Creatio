import FileService from '../../services/FileService.js'
import { gamePathGenerator, getFileExtension } from '../../helpers/query.js'

async function getFileController(req, res, next) {
  try {
    const path = req.params.filename || req.query.fileName || req.params[0]
    const { type, file } = await FileService.read.getFile(req.body.policy, req.body.file || path)
    if (type === 'stream') {
      file.pipe(res)
    } else {
      res.json({ url: file })
    }
  } catch (err) {
    next(err)
  }
}

async function uploadFiles(req, res, next) {
  try {
    const { gameId, version } = req.body
    if (!gameId || !version) throw new Error('gameId ou version faltando')

    const files = req.files || []
    if (!files.length) throw new Error('Nenhum arquivo enviado')

    const pathName = `${gamePathGenerator(gameId, version)}/assets`
    const urls = []

    for (const file of files) {
      const ext = getFileExtension(file.originalname) || 'bin'

      const url = await FileService.write.queueSave(gameId + '_' + Date.now(), file.buffer, {
        bucket: 'private',
        meta: { 'Content-Type': file.mimetype || 'application/octet-stream' },
        objectNameGenerator: () =>
          `${pathName}/${Date.now()}_${file.originalname || 'asset'}.${ext}`,
      })

      urls.push(url)
    }

    res.json({ urls })
  } catch (err) {
    next(err)
  }
}

export { getFileController, uploadFiles }
