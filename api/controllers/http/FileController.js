import FileService from '../../services/FileService.js'

async function getFileController(req, res, next) {
  try {
    const path = req.params.filename || req.params[0]
    const result = await FileService.read.getFilePath(req.body.file || path, req.body.policy)
    res.json({ url: result })
  } catch (err) {
    next(err)
  }
}

export { getFileController }
