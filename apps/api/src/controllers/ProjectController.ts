import type { EditorState } from "@projeto/types";
import type { NextFunction, Request, Response } from "express";
import {
	getAnyProject,
	setProjectOnDatabase,
	validateProjectOwnership,
	updateProject,
} from "#api/services/ProjectService.ts";
import { getUserIDFromSessionToken } from "#api/services/UserSessionService.ts";
import EditorService from "#api/services/EditorService.ts";
import { compileProjectState } from "#api/services/CompilerService.ts";

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
		const state: EditorState = req.body.state || {};
		const accessToken = req.cookies.accessToken;
		const userId = await getUserIDFromSessionToken(accessToken);
		const result = await setProjectOnDatabase({
			title: state?.info?.title || "Novo Projeto",
			description: state?.info?.description || null,
			userId,
			accessToken,
			state,
			version: state?.info?.version || "0.1.0",
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

async function updateProjectController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { id, title, description } = req.body;
		if (!id) throw new Error("ID do projeto não fornecido");
		const accessToken = req.cookies.accessToken;
		if (!accessToken) throw new Error("Usuário não autenticado");
		
		const updatedProject = await updateProject(Number(id), { title, description }, accessToken);
		res.json(updatedProject);
	} catch (err) {
		next(err);
	}
}

async function duplicateProjectController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { id } = req.body;
		if (!id) throw new Error("ID do projeto não fornecido");
		const accessToken = req.cookies.accessToken;
		if (!accessToken) throw new Error("Usuário não autenticado");
		const userId = await getUserIDFromSessionToken(accessToken);
		
		const originalProject = await validateProjectOwnership(Number(id), accessToken);
		const originalState = await EditorService.getState({
			id: Number(id),
			version: originalProject.version ?? "0.1.0",
			accessToken,
		});
		
		const newProject = await setProjectOnDatabase({
			title: `${originalProject.title} (cópia)`,
			description: originalProject.description,
			userId,
			accessToken,
			state: originalState as EditorState,
			version: "0.1.0",
		});
		
		res.json(newProject);
	} catch (err) {
		next(err);
	}
}

async function getProjectStateController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const id = Number(req.query.id);
		if (!id) throw new Error("ID do projeto não fornecido");
		const accessToken = req.cookies.accessToken;
		if (!accessToken) throw new Error("Usuário não autenticado");

		const project = await validateProjectOwnership(id, accessToken);
		const state = await EditorService.getState({
			id,
			version: project.version ?? "0.1.0",
			accessToken,
		});
		res.json(
			state || {
				info: {
					id: project.id,
					title: project.title,
					description: project.description,
					version: project.version || "0.1.0",
					updatedAt: project.updatedAt,
				},
				nodes: [],
				connections: [],
			},
		);
	} catch (err) {
		next(err);
	}
}

async function saveProjectStateController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const accessToken = req.cookies.accessToken;
		if (!accessToken) throw new Error("Usuário não autenticado");
		const { id, state } = req.body;
		if (!id) throw new Error("ID do projeto não fornecido");

		await validateProjectOwnership(Number(id), accessToken);
		const objectName = await EditorService.saveState({
			id: Number(id),
			version: state?.info?.version || "0.1.0",
			state,
			accessToken,
		});
		res.json({ objectName });
	} catch (err) {
		next(err);
	}
}

async function compileProjectStateController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { state } = req.body;
		if (!state) throw new Error("Estado do projeto não fornecido");
		const accessToken = req.cookies.accessToken;
		if (!accessToken) throw new Error("Usuário não autenticado");
		if (state.info?.id) {
			await validateProjectOwnership(Number(state.info.id), accessToken);
		}
		const result = await compileProjectState({ state });
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export {
	getAnyProjectController,
	setProjectOnDatabaseController,
	deleteProjectController,
	updateProjectController,
	duplicateProjectController,
	getProjectStateController,
	saveProjectStateController,
	compileProjectStateController,
};

