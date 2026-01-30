import "#api/config/env.ts";
import server from "#api/config/index.ts";
import log from "#api/helpers/console.ts";

import { authenticateService } from "#api/services/EmailService.ts";

const PORT = 3000;
const startServer = async () => {
	try {
		// Lógicas de inicialização
		const mailService = await authenticateService();
		if (!mailService.isAuth)
			log.info(`Abrindo no navegador [${mailService.url}]`);

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
