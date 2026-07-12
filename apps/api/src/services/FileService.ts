import type { Readable } from "node:stream";
import { text } from "node:stream/consumers";
import { debounce } from "lodash-es";
import * as Minio from "minio";
import { env } from "#api/config/env.ts";
import log from "#api/helpers/console.ts";

type DiskName = "public" | "private";
type FileTypes = "stream" | "url";

interface FileManipulationParams {
	bucket?: DiskName;
	filepath: string;
}

interface SaveFunctionOptions {
	meta?: Record<string, any>;
}

interface SaveParams extends FileManipulationParams {
	bucket: DiskName;
	payload: Buffer | Readable | string | Record<string, any>;
	opts?: SaveFunctionOptions;
}

type GetFileParams = FileManipulationParams;
type GetFilesReturns =
	| { type: "stream"; file: Readable }
	| { type: "url"; file: string };

async function main() {
	try {
		const minioClient = new Minio.Client({
			endPoint: env.MINIO_ENDPOINT,
			port: env.MINIO_PORT,
			useSSL: process.env.NODE_ENV === "production",
			accessKey: env.MINIO_USER,
			secretKey: env.MINIO_PASSWORD,
		});
		const disks: DiskName[] = ["private", "public"];
		for (const disk of disks) {
			if (!(await minioClient.bucketExists(disk))) {
				await minioClient.makeBucket(disk, "us-east-1");
				if (disk === "public") {
					const policy = {
						Version: "2012-10-17",
						Statement: [
							{
								Effect: "Allow",
								Principal: "*",
								Action: ["s3:GetObject"],
								Resource: [`arn:aws:s3:::${disk}/*`],
							},
						],
					};
					await minioClient.setBucketPolicy(disk, JSON.stringify(policy));
				}
				log.success(`Bucket ${disk} criado com sucesso!`);
			} else {
				log.info(`Bucket ${disk} já existe, pulando criação.`);
			}
		}
		log.success("Storage inicializado com sucesso!");
		return minioClient;
	} catch (err) {
		log.error("Erro ao inicializar o storage:", err);
		throw err;
	}
}

const storage = await main();

async function getDisk(name: DiskName) {
	try {
		const disk = storage.bucketExists(name);
		return disk;
	} catch (err) {
		log.error(`Erro ao acessar o disco ${name}:`, err);
		return null;
	}
}

const _debouncedSave = debounce(
	async (bucket: DiskName, filepath: string, payload: any) => {
		try {
			let data: Buffer;
			if (
				typeof payload === "object" &&
				!Buffer.isBuffer(payload) &&
				!(payload as any).pipe
			) {
				data = Buffer.from(JSON.stringify(payload));
			} else if (typeof payload === "string") {
				data = Buffer.from(payload);
			} else {
				data = payload as Buffer;
			}
			await storage.putObject(bucket, filepath, data, data.length);
			log.success(`Arquivo salvo: ${filepath}`);
		} catch (err) {
			log.error(`Erro ao salvar ${filepath}:`, err);
		}
	},
	1000,
);

const write = {
	/**
	 * Executa o salvamento de um arquivo no storage selecionado.
	 */
	queueSave: async ({ bucket, filepath, payload }: SaveParams) => {
		if (!(await getDisk(bucket))) throw new Error("Parâmetros inválidos");
		return _debouncedSave(bucket, filepath, payload);
	},
};

const read = {
	getFile: async ({
		bucket = "public",
		filepath,
	}: GetFileParams): Promise<GetFilesReturns> => {
		const disk = await getDisk(bucket);
		if (!disk)
			throw new Error(
				"Não foi possível obter o arquivo: Erro interno no servidor",
			);
		if (bucket === "public") {
			const stream = await storage.getObject(bucket, filepath);
			if (!stream) throw new Error("Arquivo não encontrado no servidor");
			return { type: "stream", file: stream };
		} else {
			const url = await storage.presignedGetObject(bucket, filepath, 60 * 60);
			if (!url) throw new Error("Arquivo não encontrado no servidor");
			return { type: "url", file: url };
		}
	},

	readJson: async ({ bucket = "public", filepath }: GetFileParams) => {
		const disk = await getDisk(bucket);
		if (!disk)
			throw new Error(
				"Não foi possível recuperar o arquivo: Erro interno no servidor",
			);
		const content = await storage.getObject(bucket, filepath);
		if (!content) throw new Error("Arquivo não encontrado no servidor");
		return JSON.parse(await text(content));
	},
};

export default { write, read };
