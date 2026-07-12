import type { Request } from "express";

export interface AuthenticatedRequest extends Request {
	user: any;
	accessToken: string;
	refreshToken: string;
}
