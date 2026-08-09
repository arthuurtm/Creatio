import log from "#api/helpers/console.ts";
import { generateRandomNumbers } from "#api/helpers/numbers.ts";

interface VerificationEntry {
	id: string;
	uuid: string;
	code: string;
	expiresAt: number;
}

const verificationCodesDB: Map<string, VerificationEntry> = new Map();
type PublicVerificationEntry = Omit<VerificationEntry, "uuid">;

/**
 *
 * @param id identificador do serviço que solicitou o código. guarda o uuid
 * @param timeout tempo em minutos para expiração do código
 */
async function createVerificationCode(
	id: string,
	timeout = 5,
): Promise<PublicVerificationEntry> {
	const sanitizedId = String(id).trim().toLowerCase();
	const newCodeEntry: VerificationEntry = {
		id: sanitizedId,
		uuid: crypto.randomUUID(),
		code: generateRandomNumbers(),
		expiresAt: Date.now() + timeout * 60000,
	};

	const { uuid, ...secureEntry } = newCodeEntry;
	verificationCodesDB.set(sanitizedId, newCodeEntry);
	return secureEntry;
}

/**
 * @abstract valida o código de verificação.
 * se válido e não expirado, ele é removido para não ser usado novamente.
 * retorna o uuid, que é o passe de segurança.
 */
async function validateCodeAndGetUUID(id: string, code: string) {
	try {
		const sanitizedId = String(id).trim().toLowerCase();
		const sanitizedCode = String(code).trim();
		const foundEntry = verificationCodesDB.get(sanitizedId);

		if (!foundEntry || String(foundEntry.code).trim() !== sanitizedCode) {
			throw new Error("Código não encontrado ou inválido");
		}

		if (Date.now() > foundEntry.expiresAt) {
			verificationCodesDB.delete(sanitizedId);
			throw new Error("Código expirado");
		}

		return {
			valid: true,
			uuid: foundEntry.uuid,
			reason: "Código verificado com sucesso!",
		};
	} catch (err) {
		return {
			valid: false,
			uuid: null,
			reason: (err as Error).message,
		};
	}
}

/**
 * @abstract deleta o uuid de verificação, removendo-o do banco de dados.
 */
async function consumeVerificationUUID(uuid: string) {
	const entryArray = Array.from(verificationCodesDB.values());
	const foundEntry = entryArray.find((entry) => entry.uuid === uuid);

	if (!foundEntry) {
		throw new Error("Sessão não encontrada ou inválida");
	}
	if (Date.now() > foundEntry.expiresAt) {
		verificationCodesDB.delete(foundEntry.id);
		throw new Error("Sessão expirada");
	}

	verificationCodesDB.delete(foundEntry.id);
	return foundEntry;
}

export {
	createVerificationCode,
	validateCodeAndGetUUID,
	consumeVerificationUUID,
};
