import { Router } from 'express'
import multer from 'multer'
import isAuthenticated from '../middlewares/isAuthenticated.js'
import { getFileController, uploadFiles } from '../controllers/http/FileController.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get('/public/:filename', getFileController)
router.get('/public/*', getFileController)
router.get('/public', getFileController)
router.post('/upload', isAuthenticated, upload.array('files'), uploadFiles)

let FilesRoute = router
export default FilesRoute
