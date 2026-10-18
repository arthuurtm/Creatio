import type { Request, Response } from "express";
import log from "#api/helpers/console.ts";
import { sendEmailService } from "#api/services/EmailService.ts";

async function sendEmail(req: Request, res: Response): Promise<void> {
	try {
		const { template, to, subject } = req.body;
		await sendEmailService({ template, to, subject, ...req.body });
		res.json({ success: true });
	} catch (err) {
		log.error("Erro ao enviar e-mail:", err);
		res.status(500).json({ success: false, message: "Falha ao enviar e-mail" });
	}
}

export { sendEmail };
