import type { Request, Response } from "express";
import { Router } from "express";
import log from "#api/helpers/console.ts";
import { handleOAuthCallback } from "#api/services/EmailService.ts";

const router = Router();

router.get("/oauth2callback", async (req: Request, res: Response) => {
	try {
		const { code } = req.query;
		if (!code) throw new Error("Parâmetro com valor inválido.");
		await handleOAuthCallback(String(code));
		res.send("Autenticado com sucesso, pode fechar a janela!");
	} catch {
		log.warn("Solicitação negada em oauth2callback");
		res.status(403).send();
	}
});

export default router;
