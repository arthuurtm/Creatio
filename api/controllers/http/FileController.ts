import type { NextFunction, Request, Response } from "express";
import { forEach } from "lodash-es";
import { gamePathGenerator, getFileExtension } from "#api/helpers/query.ts";
import FileService from "#api/services/FileService.ts";

async function getFileController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const path = req.params.filename || req.params.rest || req.query.fileName;

		const { type, file } = await FileService.read.getFile({
			bucket: req.body.policy,
			filepath: req.body.file ?? path,
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
	try {
		const { gameId, version } = req.body;
		if (!gameId || !version) throw new Error("gameId ou version faltando");

		const files = req.files as Express.Multer.File[];
		if (!files || !Array.isArray(files) || files.length === 0) {
			throw new Error("Nenhum arquivo enviado");
		}

		const pathName = `${gamePathGenerator(gameId, version)}/assets`;

		const uploadPromises = files.map(async (file) => {
			const ext = getFileExtension(file.originalname) || "bin";
			return await FileService.write.queueSave({
				bucket: "private",
				filepath: `${pathName}/${Date.now()}_${file.originalname || "asset"}.${ext}`,
				payload: file.buffer,
			});
		});

		const urls = await Promise.all(uploadPromises);

		res.json({ urls });
	} catch (err) {
		next(err);
	}
}

export { getFileController, uploadFiles };
