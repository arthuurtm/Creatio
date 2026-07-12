import type { NextFunction, Request, Response } from "express";
import log from "#api/helpers/console.ts";

export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	log.info("Requisição recebida: ", req.method, req.originalUrl);
	next();
};
