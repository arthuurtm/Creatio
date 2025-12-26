import type { Readable } from "node:stream";
import { Readable as FReadable } from "node:stream";
import { StorageManager } from "@slynova/flydrive";
import { AmazonWebServicesS3Storage } from "@slynova/flydrive-s3";
import { debounce } from "lodash-es";
import { env } from "#api/config/env.ts";

type DiskName = "public" | "private";
type FileTypes = "stream" | "url";

interface FileManipulationParams {
	bucket: DiskName;
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
	payload: Record<string, any> | Buffer | Readable | string;
	opts?: SaveFunctionOptions;
}

interface GetFileParams extends FileManipulationParams {}
type GetFilesReturns =
	| { type: "stream"; file: FReadable }
	| { type: "url"; file: string };

const storage = new StorageManager({
	default: "public",
	disks: {
		public: {
			driver: "s3",
			config: {
				key: env.MINIO_USER,
				secret: env.MINIO_PASSWORD,
				endpoint: env.MINIO_ENDPOINT,
				bucket: "public-assets",
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
				bucket: "private-data",
				region: "us-east-1",
				s3ForcePathStyle: true,
			},
		},
	},
});

storage.registerDriver("s3", AmazonWebServicesS3Storage);

export function getDisk(name: DiskName) {
	return storage.disk(name);
}

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

		return debounce(() => disk.put(filepath, finalData), 1000);
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
			return { type: "stream", file: stream };
		} else {
			const { signedUrl: url } = await disk.getSignedUrl(filepath, {
				expiry: 3600,
			});
			return { type: "url", file: url };
		}
	},

	readJson: async ({ bucket, filepath }: GetFileParams) => {
		const disk = getDisk(bucket);
		return await disk.get(filepath, "utf-8");
	},
};

export default { write, read };
