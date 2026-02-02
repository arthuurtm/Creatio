import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";
import log from "#api/helpers/console.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "./.env");

dotenv.config({ path: envPath });

const envSchema = z.object({
	DATABASE: z.string().min(1, "Database name is required"),
	DB_PASSWORD: z.string().min(1, "Database password is required"),
	DB_USER: z.string().min(1, "Database user is required"),
	ACCESS_TOKEN_SECRET: z.string().min(10, "Secret muito curto!"),
	REFRESH_TOKEN_SECRET: z.string().min(10, "Secret muito curto!"),
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	EMAIL_FROM: z.email("Email inválido!"),
	VITE_GCLIENT_LOGIN_ID: z.string().optional(),
	PORT: z.string().default("3000").optional(),
	MINIO_ENDPOINT: z.string(),
	MINIO_USER: z.string().min(1, "Minio user is required"),
	MINIO_PASSWORD: z.string().min(1, "Minio password is required"),
});

// valida o process.env contra o Schema
const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
	log.error("Variáveis de ambiente inválidas:", z.treeifyError(_env.error));
	throw new Error("Variáveis de ambiente inválidas.");
}

export const env = _env.data;
