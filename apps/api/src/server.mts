import "#api/config/env.ts";
import server from "#api/config/index.ts";
import log from "#api/helpers/console.ts";

import { authenticateService } from "#api/services/EmailService.ts";

const PORT = 3000;
const startServer = async () => {
	try {
		// Inicia o servidor HTTP primeiro para garantir a disponibilidade da API
		server.listen(PORT, () => {
			log.info(`Servidor rodando em http://localhost:${PORT}`);
		});

		// Inicializa o serviço de e-mail em segundo plano de forma não-bloqueante
		authenticateService()
			.then((mailService) => {
				if (!mailService.isAuth && mailService.url) {
					log.info(`Autenticação de e-mail necessária. Abra no navegador: [${mailService.url}]`);
				}
			})
			.catch((err) => {
				log.warn("Serviço de e-mail não pôde ser autenticado na inicialização (sem conexão?):", err?.message || err);
			});
	} catch (error) {
		log.error("Falha ao iniciar o servidor:", error);
		process.exit(1);
	}
};

startServer();
