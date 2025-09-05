import FileService from '../../services/FileService.js'

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

export { getFileController }
