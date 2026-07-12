import type {
	RouteContext,
	WebSocket,
	WebSocketMessage,
	WebSocketServer,
} from "@projeto/types";
import ProjectLabController from "#api/controllers/ws/ProjectLABController.ts";
import log from "#api/helpers/console.ts";

type RouteHandler<T = any> = (context: RouteContext<T>) => Promise<any>;
const routes: Record<string, RouteHandler | null> = {
	"project:lab:get:json": ProjectLabController.getJson,
	"project:lab:update:json": ProjectLabController.updateJson,
	"project:lab:upgrade": null,
	"project:join": null,
	"project:leave": null,
};

const handleConnection = (ws: WebSocket, wss: WebSocketServer): void => {
	ws.on("message", async (message: Buffer) => {
		try {
			const data = JSON.parse(message.toString()) as WebSocketMessage;
			log.info("Evento WebSocket recebido: ", data.event);
			// log.debug("Event raw: ", data);

			// Encontra a função do controller baseada no evento
			const handler = routes[data.event as keyof typeof routes];

			if (handler && data.payload) {
				// Cria um objeto de contexto para passar informações úteis
				const context: RouteContext<any> = {
					ws,
					wss,
					payload: data.payload,
				};
				await handler(context);
			} else {
				log.warn(`Nenhum handler encontrado para o evento: ${data.event}`);
				ws.send(
					JSON.stringify({
						event: "server:error",
						payload: { message: `Evento '${data.event}' desconhecido` },
					}),
				);
			}
		} catch (error) {
			log.error("Erro ao processar a mensagem:", error);
			ws.send(
				JSON.stringify({
					event: "server:error",
					payload: { message: "Mensagem inválida" },
				}),
			);
		}
	});
};

export default handleConnection;
