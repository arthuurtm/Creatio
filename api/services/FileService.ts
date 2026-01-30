import type { Readable } from "node:stream";
import { Readable as FReadable } from "node:stream";
import { StorageManager } from "@slynova/flydrive";
import { AmazonWebServicesS3Storage } from "@slynova/flydrive-s3";
import { debounce } from "lodash-es";
import { env } from "#api/config/env.ts";
import log from "#api/helpers/console.ts";

type DiskName = "public" | "private";
type FileTypes = "stream" | "url";

interface FileManipulationParams {
	bucket?: DiskName;
	filepath: string;
}

/**
 * Opções específicas para a operação no Storage
 */
interface SaveFunctionOptions {
	meta?: Record<string, any>;
}

/**
 * Parâmetros de entrada para a função de salvamento
 */
interface SaveParams extends FileManipulationParams {
	bucket: DiskName;
	payload: unknown;
	opts?: SaveFunctionOptions;
}

interface GetFileParams extends FileManipulationParams {}
type GetFilesReturns =
	| { type: "stream"; file: FReadable }
	| { type: "url"; file: string };

function initServer(): StorageManager {
	try {
		const srv = new StorageManager({
			default: "public",
			disks: {
				public: {
					driver: "s3",
					config: {
						key: env.MINIO_USER,
						secret: env.MINIO_PASSWORD,
						endpoint: env.MINIO_ENDPOINT,
						bucket: "public",
						region: "us-east-1",
						s3ForcePathStyle: true,
					},
				},
				private: {
					driver: "s3",
					config: {
						key: env.MINIO_USER,
						secret: env.MINIO_PASSWORD,
						endpoint: env.MINIO_ENDPOINT,
						bucket: "private",
						region: "us-east-1",
						s3ForcePathStyle: true,
					},
				},
			},
		});
		log.success("Servidor de arquivos criado/verificado com sucesso!");
		return srv;
	} catch (err) {
		log.error("Ocorreu um erro no servidor de arquivos: ", err);
		throw err;
	}
}

const storage = initServer();
storage.registerDriver("s3", AmazonWebServicesS3Storage);

export function getDisk(name: DiskName) {
	return storage.disk(name);
}

const _debouncedSave = debounce(async (disk, filepath, finalData) => {
	try {
		await disk.put(filepath, finalData);
		log.success(`Arquivo salvo: ${filepath}`);
	} catch (err) {
		log.error(`Erro ao salvar ${filepath}:`, err);
	}
}, 1000);

const write = {
	/**
	 * Executa o salvamento de um arquivo no storage selecionado.
	 * * @param params - Objeto contendo key, payload e opções de bucket/nome.
	 * @returns Promise com o resultado da operação do Flydrive.
	 */
	queueSave: async ({ bucket, filepath, payload }: SaveParams) => {
		const disk = getDisk(bucket);

		const finalData =
			typeof payload === "object" &&
			!Buffer.isBuffer(payload) &&
			!(payload instanceof FReadable)
				? JSON.stringify(payload)
				: payload;

		return _debouncedSave(disk, filepath, finalData);
	},
};

const read = {
	getFile: async ({
		bucket = "public",
		filepath,
	}: GetFileParams): Promise<GetFilesReturns> => {
		const disk = getDisk(bucket);
		if (bucket === "public") {
			const stream = disk.getStream(filepath) as FReadable;
			if (!stream) throw new Error("Arquivo não encontrado no servidor");
			return { type: "stream", file: stream };
		} else {
			const { signedUrl: url } = await disk.getSignedUrl(filepath, {
				expiry: 3600,
			});
			if (!url) throw new Error("Arquivo não encontrado no servidor");
			return { type: "url", file: url };
		}
	},

	readJson: async ({ bucket = "public", filepath }: GetFileParams) => {
		const disk = getDisk(bucket);
		const content = await disk.get(filepath, "utf-8");
		if (!content) throw new Error("Arquivo não encontrado no servidor");
		return JSON.parse(content.content);
	},
};

export default { write, read };
