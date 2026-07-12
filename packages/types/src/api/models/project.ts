export interface ProjectAttributes {
	id: number;
	title: string;
	description: string | null;
	version: string | null;
	thumbnails: string[] | null;
	userId: number;
	createdAt: Date;
	updatedAt: Date;
}

export type ProjectCreationAttributes = Omit<
	ProjectAttributes,
	"id" | "createdAt" | "updatedAt"
>;
