import mysql from "mysql2/promise";
import { Sequelize } from "sequelize";
import log from "#api/helpers/console.ts";
import { env } from "./env.ts";

async function initialize() {
	try {
		// garantir que o banco de dados exista
		const connection = mysql.createPool({
			host: env.DB_HOST,
			user: env.DB_USER,
			password: env.DB_PASSWORD,
			database: env.DATABASE,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
		});

		try {
			await connection.query(
				`CREATE DATABASE IF NOT EXISTS \`${env.DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;`,
			);
			log.success("Banco de dados verificado/criado com sucesso!");
		} catch (err) {
			log.error("Erro ao criar banco de dados: ", err);
		} finally {
			await connection.end();
		}

		// criar e autenticar a instância do Sequelize
		const sequelizeInstance = new Sequelize(
			env.DATABASE ?? "",
			env.DB_USER ?? "",
			env.DB_PASSWORD ?? "",
			{
				host: env.DB_HOST || "localhost",
				dialect: "mysql",
			},
		);

		// teste de conexão
		await sequelizeInstance.authenticate();
		log.success("Conexão com o Sequelize estabelecida com sucesso.");

		return sequelizeInstance;
	} catch (error) {
		log.error("Não foi possível conectar ao banco de dados: ", error);
		throw error;
	}
}

const sequelize = await initialize();

export default sequelize;
