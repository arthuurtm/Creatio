import { Router } from "express";
import multer from "multer";
import {
	getFileController,
	uploadFiles,
} from "#api/controllers/http/FileController.ts";
import isAuthenticated from "#api/middlewares/isAuthenticated.ts";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/public/:filename", getFileController);
router.get("/public/{0,}", getFileController);
router.get("/public", getFileController);
router.post("/upload", isAuthenticated, upload.array("files"), uploadFiles);

export default router;
