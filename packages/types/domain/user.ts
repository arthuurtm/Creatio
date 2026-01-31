export interface BackendUserAuth {
	accessToken: string;
	refreshToken: string;
}

export interface BackendUser extends BackendUserAuth {
	id: string;
	email: string;
	name: string;
}
