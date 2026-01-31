import type { ErrorRequestHandler } from "express";
import log from "#api/helpers/console.ts";

// Atribuindo o tipo ErrorRequestHandler à função
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	if (err instanceof Error) {
		log.error(err.stack ?? "Erro no servidor");
	} else {
		log.error(JSON.stringify(err));
	}

	const status = (err as any).status || 500;

	res.status(status).json({
		success: false,
		message: err instanceof Error ? err.message : "Erro interno no servidor",
	});
};
