import { Router } from 'express'
import isAuthenticated from '../middlewares/isAuthenticated.js'
import { getFileController } from '../controllers/http/FileController.js'

const router = Router()

router.post('/public/*', getFileController)
router.get('/public/:filename', getFileController)

const FilesRoute = router
export default FilesRoute
