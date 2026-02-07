export type Genres =
	| "Ação"
	| "RPG"
	| "Estratégia (MOBA e RTS)"
	| "Simulação"
	| "Aventura"
	| "Sobrevivência"
	| "Horror"
	| "Esportes"
	| "Corrida"
	| "Luta"
	| "Puzzle"
	| "Sandbox";

export interface GameAttributes {
  id: string;
  title: string;
  description: string | null;
  genre: Genres | null;
  version: string | null;
  thumbnails: Record<string, string> | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type GameCreationAttributes = Omit<
  GameAttributes,
  "id" | "createdAt" | "updatedAt"
>;
