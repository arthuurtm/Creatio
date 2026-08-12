import type { NextFunction, Request, Response } from "express";
import { User } from "#api/models/index.ts";
import { getUserIDFromSessionToken } from "#api/services/UserSessionService.ts";
import FileService from "#api/services/FileService.ts";

const ALLOWED_FIELDS = ["username", "nickname", "email"] as const;
type EditableField = (typeof ALLOWED_FIELDS)[number];

/**
 * Atualiza um campo individual do perfil do usuário.
 * Recebe { field, value } no body.
 */
async function updateProfileFieldController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { field, value } = req.body;
		if (!field || !value) throw new Error("Campo e valor são obrigatórios");
		if (!ALLOWED_FIELDS.includes(field as EditableField)) {
			throw new Error(`Campo '${field}' não é editável`);
		}

		const accessToken = req.cookies.accessToken;
		if (!accessToken) throw new Error("Usuário não autenticado");
		const userId = await getUserIDFromSessionToken(accessToken);

		// Verificar unicidade para username e email
		if (field === "username" || field === "email") {
			const existing = await User.findOne({
				where: { [field]: value },
			});
			if (existing && existing.id !== userId) {
				throw new Error(
					field === "username"
						? "Este nome de usuário já está em uso"
						: "Este e-mail já está em uso",
				);
			}
		}

		const user = await User.findByPk(userId);
		if (!user) throw new Error("Usuário não encontrado");

		await user.update({ [field]: value });
		res.json({ success: true, [field]: value });
	} catch (err) {
		next(err);
	}
}

/**
 * Faz upload da foto de perfil do usuário.
 * Recebe o arquivo via multer (req.file).
 */
async function uploadProfilePicController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const accessToken = req.cookies.accessToken;
		if (!accessToken) throw new Error("Usuário não autenticado");
		const userId = await getUserIDFromSessionToken(accessToken);

		const file = req.file;
		if (!file) throw new Error("Nenhum arquivo enviado");

		const ext = file.originalname.split(".").pop()?.toLowerCase() || "png";
		const filepath = `avatars/${userId}/profile.${ext}`;

		await FileService.write.queueSave({
			bucket: "public",
			filepath,
			payload: file.buffer,
		});

		const user = await User.findByPk(userId);
		if (!user) throw new Error("Usuário não encontrado");

		await user.update({ profilePic: filepath });
		res.json({ success: true, url: filepath });
	} catch (err) {
		next(err);
	}
}

/**
 * Remove a foto de perfil do usuário.
 */
async function deleteProfilePicController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const accessToken = req.cookies.accessToken;
		if (!accessToken) throw new Error("Usuário não autenticado");
		const userId = await getUserIDFromSessionToken(accessToken);

		const user = await User.findByPk(userId);
		if (!user) throw new Error("Usuário não encontrado");

		// TODO: Deletar o arquivo do MinIO (FileService ainda não tem método delete)
		// await FileService.delete({ bucket: "public", filepath: user.profilePic });

		await user.update({ profilePic: null });
		res.json({ success: true, message: "Foto de perfil removida" });
	} catch (err) {
		next(err);
	}
}

export {
	updateProfileFieldController,
	uploadProfilePicController,
	deleteProfilePicController,
};
