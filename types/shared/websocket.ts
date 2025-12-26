import type { WebSocket, WebSocketServer } from "ws";

export interface WebSocketMessage {
	event: string;
	payload?: unknown;
}

export interface RouteContext<T = unknown> {
	ws: WebSocket;
	wss: WebSocketServer;
	data: T;
}

export type { WebSocket, WebSocketServer };
