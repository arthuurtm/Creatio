import { Router } from 'express'
import isAuthenticated from '../middlewares/isAuthenticated.js'
import { getFileController } from '../controllers/http/FileController.js'

const router = Router()

router.get('/public/:filename', getFileController)
router.get('/public/*', getFileController)
router.get('/public', getFileController)

let FilesRoute = router
export default FilesRoute
