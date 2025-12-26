import "#api/config/env.ts";
import server from "#api/config/index.ts";
import log from "#api/helpers/console.ts";

// import { authenticateService } from "#api/services/EmailService.js";

const PORT = 3000;
const startServer = async () => {
	try {
		// Lógicas de inicialização
		// const authUrl = await authenticateService();
		// log.info(`Abrindo no navegador [${authUrl}]`);

		// Inicia o servidor
		server.listen(PORT, () => {
			log.info(`Servidor rodando em http://localhost:${PORT}`);
		});
	} catch (error) {
		log.error("Falha ao iniciar o servidor:", error);
		process.exit(1);
	}
};

startServer();
