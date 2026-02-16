import type {
	GameStateAttributes,
	GameStateCreationAttributes,
	GameStatePlayerStatus,
} from "@projeto/types";
import {
	type CreationOptional,
	DataTypes,
	type ForeignKey,
	Model,
} from "sequelize";
import sequelize from "#api/config/db.ts";
import Game from "./Game.ts";
import User from "./User.ts";

export class GameState extends Model<
	GameStateAttributes,
	GameStateCreationAttributes
> {
	declare id: CreationOptional<number>;
	declare userId: ForeignKey<User["id"]>;
	declare gameId: ForeignKey<Game["id"]>;
	declare stateData: string;
	declare saveVersion: string | null;
	declare slotIndex: CreationOptional<number>;
	declare status: CreationOptional<GameStatePlayerStatus>;
	declare isLiked: CreationOptional<boolean>;
	declare sessionId: string | null;
	declare hostUserId: ForeignKey<User["id"]> | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

GameState.init(
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: { model: User, key: "id" },
			onDelete: "CASCADE",
		},
		gameId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: { model: Game, key: "id" },
			onDelete: "CASCADE",
		},
		stateData: {
			type: DataTypes.STRING,
			allowNull: false,
			comment: "link para o arquivo JSON com o estado salvo do jogo",
		},
		saveVersion: { type: DataTypes.STRING, allowNull: true },
		slotIndex: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
			comment: "vários saves (0=AutoSave, 1=Slot1, 2=Slot2...)",
		},
		status: {
			type: DataTypes.ENUM("playing", "completed", "dropped", "on_hold"),
			defaultValue: "playing",
			comment: "status para o histórico do usuário",
		},
		isLiked: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			comment: "se o usuário curtiu este jogo",
		},
		sessionId: {
			type: DataTypes.UUID,
			allowNull: true,
			comment:
				"se dois usuários têm o mesmo sessionId e gameId, estão jogando juntos",
		},
		hostUserId: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: { model: User, key: "id" },
		},
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{
		sequelize,
		timestamps: true,
		modelName: "GameStates",
		indexes: [
			{
				unique: true,
				fields: ["userId", "gameId", "slotIndex"],
				name: "user_game_slot_unique",
			},
			{
				fields: ["sessionId"],
				name: "session_lookup_idx",
			},
			{
				fields: ["updatedAt"],
				name: "recent_activity_idx",
			},
		],
	},
);

export default GameState;
