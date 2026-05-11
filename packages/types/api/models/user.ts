export interface UserAttributes {
	id: number;
	email: string;
	username: string;
	nickname: string | null;
	passwordHash: string;
	profilePic: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export type UserCreationAttributes = Omit<
	UserAttributes,
	"id" | "createdAt" | "updatedAt"
>;
