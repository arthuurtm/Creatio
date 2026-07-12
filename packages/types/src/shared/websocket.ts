import type { WebSocket, WebSocketServer } from "ws";

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

export type ConnStatusValues =
	| "CONNECTING"
	| "OPEN"
	| "CLOSING"
	| "CLOSED"
	| "RECONNECTING";

export type RequestStatusValues =
	| "IDLE"
	| "SENDING"
	| "ERROR"
	| "WAITING"
	| "SUCCESS";

export interface WebSocketError {
	message?: string;
	raw: Error | Event | DOMException | Record<string, unknown> | unknown | null;
}
