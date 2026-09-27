import "#api/config/env.ts";
import server from "#api/config/index.ts";
import log from "#api/helpers/console.ts";

const PORT = 3000;
const startServer = async () => {
	try {
		server.listen(PORT, () => {
			log.info(`Servidor rodando em http://localhost:${PORT}`);
		});
	} catch (error) {
		log.error("Falha ao iniciar o servidor:", error);
		process.exit(1);
	}
};

startServer();
