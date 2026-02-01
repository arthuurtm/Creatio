import { DeviceData } from "../domain";

export interface SessionAttributes {
	id: number;
	accessToken: string;
	refreshToken: string;
	deviceData: DeviceData;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
}

export type SessionCreationAttributes = Omit<SessionAttributes, 'id' | 'createdAt' | 'updatedAt'>
