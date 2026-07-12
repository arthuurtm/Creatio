import type { NextFunction, Request, Response } from "express";
import { projectPathGenerator, getFileExtension } from "#api/helpers/query.ts";
import FileService from "#api/services/FileService.ts";

async function getFileController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const path = req.params.filename || req.params.rest || req.query.fileName;

		const { type, file } = await FileService.read.getFile({
			filepath: String(path),
		});

		if (type === "stream") {
			file.pipe(res);
		} else {
			res.json({ url: file });
		}
	} catch (err) {
		next(err);
	}
}

async function uploadFiles(req: Request, res: Response, next: NextFunction) {
	// try {
	// 	const files = req.files as Express.Multer.File[];
	// 	if (!files || !Array.isArray(files) || files.length === 0) {
	// 		throw new Error("Nenhum arquivo enviado");
	// 	}
	// 	const uploadPromises = files.map(async (file) => {
	// 		const ext = getFileExtension(file.originalname) || "bin";
	// 		return await FileService.write.queueSave({
	// 			bucket: "private",
	// 			filepath: `${pathName}/${Date.now()}_${file.originalname || "asset"}.${ext}`,
	// 			payload: file.buffer,
	// 		});
	// 	});
	// 	const urls = await Promise.all(uploadPromises);
	// 	res.json({ urls });
	// } catch (err) {
	// 	next(err);
	// }
}

export { getFileController, uploadFiles };
