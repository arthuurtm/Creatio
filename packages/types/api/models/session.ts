import type { DeviceData } from "../";

export interface SessionAttributes {
	id: number;
	accessToken: string;
	refreshToken: string;
	deviceData: DeviceData;
	userId: number;
	createdAt: Date;
	updatedAt: Date;
}

export type SessionCreationAttributes = Omit<
	SessionAttributes,
	"id" | "createdAt" | "updatedAt"
>;
