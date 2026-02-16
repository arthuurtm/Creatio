export type GameStatePlayerStatus =
	| "playing"
	| "completed"
	| "dropped"
	| "on_hold";

export interface GameStateAttributes {
	id: number;
	userId: number;
	gameId: number;
	stateData: string;
	saveVersion: string | null;
	slotIndex: number;
	status: GameStatePlayerStatus;
	isLiked: boolean;
	sessionId: string;
	hostUserId: number;
	createdAt: Date;
	updatedAt: Date;
}

export type GameStateCreationAttributes = Omit<
	GameStateAttributes,
	| "id"
	| "createdAt"
	| "updatedAt"
	| "status"
	| "isLiked"
	| "slotIndex"
	| "saveVersion"
>;
