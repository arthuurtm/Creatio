import mysql from "mysql2/promise";
import { Sequelize } from "sequelize";
import log from "#api/helpers/console.ts";

async function initialize() {
	try {
		// garantir que o banco de dados exista
		const connection = await mysql.createConnection({
			host: process.env.DB_HOST || "localhost",
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
		});

		try {
			await connection.query(
				`CREATE DATABASE IF NOT EXISTS \`${process.env.DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;`,
			);
			log.info("Database verificado/criado com sucesso!");
		} catch (err) {
			log.error("Erro ao criar banco de dados: ", err);
		} finally {
			await connection.end();
		}

		// criar e autenticar a instância do Sequelize
		const sequelizeInstance = new Sequelize(
			process.env.DATABASE ?? "",
			process.env.DB_USER ?? "",
			process.env.DB_PASSWORD ?? "",
			{
				host: process.env.DB_HOST || "localhost",
				dialect: "mysql",
			},
		);

		// teste de conexão
		await sequelizeInstance.authenticate();
		log.success("Conexão com o Sequelize estabelecida com sucesso.");

		return sequelizeInstance;
	} catch (error) {
		log.error("Não foi possível conectar ao banco de dados: ", error);
		process.exit(1);
	}
}

const sequelize = await initialize();

export default sequelize;
