import type { Request, Response } from "express";
import log from "#api/helpers/console.ts";
import {
	authenticateService,
	sendEmailService,
} from "#api/services/EmailService.ts";

async function sendEmail(req: Request): Promise<boolean> {
	try {
		const { template, to, subject } = req.body;
		await sendEmailService({ template, to, subject, ...req.body });
		return true;
	} catch (err) {
		log.error("Erro ao enviar e-mail:", err);
		return false;
	}
}

async function authenticate(res: Response) {
	try {
		const url = await authenticateService();
		res.send(`Abra este URL: ${url}`);
		return true;
	} catch (err) {
		res.status(500).json({ message: err });
	}
}

export { sendEmail, authenticate };
