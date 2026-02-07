import type { EditorState } from "@projeto/types";
import { ulid } from "ulid";
import { Game } from "#api/models/index.ts";
import GameEditorService from "./EditorService";
import { getUserIDFromSessionToken } from "./UserSessionService";

interface GameData {
	title: string;
	description?: string | null;
	userId: number;
	accessToken: string;
	state: EditorState;
	version: string;
}

async function getAnyGame(filters = {}) {
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
	const games = await Game.findAll({ where });
	return games;
}

async function setGameOnDatabase({
	title,
	description,
	userId,
	accessToken,
	state,
	version,
}: GameData) {
	const game = await Game.create({
		gameId: ulid(),
		title,
		description,
		userId,
	});

	if (state) {
		state.info = state.info || {};
		state.info.id = game.id;
		state.info.title = game.title;
		state.info.description = game.description;
	}

	await GameEditorService.saveState({
		id: game.id,
		version,
		state,
		accessToken,
	});

	if (!game) throw new Error("Erro ao criar o jogo");
	return game;
}

async function validateGameOwnership(id: number, accessToken: string) {
	const userId = await getUserIDFromSessionToken(accessToken);
	const game = await Game.findOne({ where: { id, userId } });
	if (!game)
		throw new Error(
			"Jogo não encontrado ou você não tem permissão para acessá-lo",
		);
	return game;
}

export { getAnyGame, setGameOnDatabase, validateGameOwnership };
