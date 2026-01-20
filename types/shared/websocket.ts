import type { WebSocketServer } from "ws";

export type { WebSocket, WebSocketServer } from "ws";

export interface WebSocketMessage<T = unknown> {
	event: string;
	payload?: T;
}

export interface RouteContext<T = unknown> {
	ws: WebSocket;
	wss: WebSocketServer;
	payload: T;
}

export interface WebSocketErrorMessage {
	raw: object;
	message: string;
}
