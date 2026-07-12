import type http from "node:http";
import cookie from "cookie";
import { WebSocketServer } from "ws";
import log from "#api/helpers/console.ts";
import { WebsocketRoute as handleConnection } from "#api/routes/index.ts";

declare module "ws" {
	interface WebSocket {
		cookies: Record<string, string | undefined>;
	}
}
/**
 *  @abstract Inicializa e anexa o servidor WebSocket a um servidor HTTP existente.
 */
function initializeWebSocket(server: http.Server): WebSocketServer {
	const wss = new WebSocketServer({ server: server, path: "/ws" });

	wss.on("connection", (ws, req) => {
		log.success("Cliente WebSocket conectado!");

		const cookies = cookie.parse(req.headers.cookie || "");
		ws.cookies = cookies;
		handleConnection(ws, wss);

		ws.on("error", (error) => {
			log.error("Erro no WebSocket: ", error);
		});
	});

	return wss;
}

export default initializeWebSocket;
