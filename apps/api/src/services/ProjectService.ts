import type { EditorState, FileInfo } from "@projeto/types";
import { Project } from "#api/models/index.ts";
import EditorService from "./EditorService";
import { getUserIDFromSessionToken } from "./UserSessionService";

interface ProjectData {
	title: string;
	description?: string | null;
	userId: number;
	accessToken: string;
	state: EditorState;
	version: string;
}

async function getAnyProject(filters = {}) {
	let where = {};

	if (filters) {
		if (typeof filters === "string") {
			try {
				where = JSON.parse(filters);
			} catch (err) {
				throw new Error("Filtros inválido, precisa ser JSON válido");
			}
		} else if (typeof filters === "object") {
			where = filters;
		}
	}
	const projects = await Project.findAll({ where });
	return projects;
}

async function setProjectOnDatabase({
	title,
	description,
	userId,
	accessToken,
	state,
	version,
}: ProjectData) {
	const project = await Project.create({
		title: title || "Novo Projeto",
		description: description || null,
		userId,
	});

	if (state) {
		state.info = state.info || ({} as FileInfo);
		state.info.id = project.id;
		state.info.title = project.title;
		state.info.description = project.description;
	}

	await EditorService.saveState({
		id: project.id,
		version: version || "0.1.0",
		state,
		accessToken,
	});

	if (!project) throw new Error("Erro ao criar o jogo");
	return project;
}

async function validateProjectOwnership(id: number, accessToken: string) {
	const userId = await getUserIDFromSessionToken(accessToken);
	const project = await Project.findOne({ where: { id, userId } });
	if (!project)
		throw new Error(
			"Jogo não encontrado ou você não tem permissão para acessá-lo",
		);
	return project;
}

async function updateProject(
	id: number,
	data: { title?: string; description?: string },
	accessToken: string,
) {
	const project = await validateProjectOwnership(id, accessToken);
	await project.update(data);
	return project;
}

export { getAnyProject, setProjectOnDatabase, validateProjectOwnership, updateProject };
