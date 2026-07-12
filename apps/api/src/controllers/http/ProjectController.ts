import type { EditorState } from "@projeto/types";
import type { NextFunction, Request, Response } from "express";
import {
	getAnyProject,
	setProjectOnDatabase,
	validateProjectOwnership,
} from "#api/services/ProjectService.ts";
import { getUserIDFromSessionToken } from "#api/services/UserSessionService.ts";

async function getAnyProjectController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const filters = req.query;
		res.json(await getAnyProject(filters));
	} catch (err) {
		next(err);
	}
}

async function setProjectOnDatabaseController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		if (!req.cookies.accessToken) throw new Error("Usuário não autenticado");
		const state: EditorState = req.body.state;
		const accessToken = req.cookies.accessToken;
		const userId = await getUserIDFromSessionToken(accessToken);
		const result = await setProjectOnDatabase({
			title: state.info.title,
			description: state.info.description,
			userId,
			accessToken,
			state,
			version: state.info.version,
		});
		res.json(result);
	} catch (err) {
		next(err);
	}
}

async function deleteProjectController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { id } = req.body;
		if (!id) throw new Error("ID do projeto não fornecido");
		const accessToken = req.cookies.accessToken;
		const project = await validateProjectOwnership(Number(id), accessToken);
		await project.destroy();
		res.json({ message: "Projeto deletado com sucesso" });
	} catch (err) {
		next(err);
	}
}

export {
	getAnyProjectController,
	setProjectOnDatabaseController,
	deleteProjectController,
};
