import { generateRandomNumbers } from "#api/helpers/numbers.ts";

interface VerificationEntry {
	id: string;
	uuid: string;
	code: string;
	expiresAt: Date;
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
	const newCodeEntry: VerificationEntry = {
		id,
		uuid: crypto.randomUUID(),
		code: generateRandomNumbers(),
		expiresAt: new Date(Date.now() + timeout * 60000),
	};

	const { uuid, ...secureEntry } = newCodeEntry;
	verificationCodesDB.set(newCodeEntry.id, newCodeEntry);
	return secureEntry;
}

/**
 * @abstract valida o código de verificação.
 * se válido e não expirado, ele é removido para não ser usado novamente.
 * retorna o uuid, que é o passe de segurança.
 */
async function validateCodeAndGetUUID(id: string, code: string) {
	try {
		const foundEntry = verificationCodesDB.get(id);

		if (!foundEntry || foundEntry.code !== code) {
			throw new Error("Código não encontrado ou inválido");
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
	if (new Date() > foundEntry.expiresAt) {
		verificationCodesDB.delete(uuid);
		throw new Error("Sessão expirada");
	}

	verificationCodesDB.delete(uuid);
	return foundEntry;
}

export {
	createVerificationCode,
	validateCodeAndGetUUID,
	consumeVerificationUUID,
};
