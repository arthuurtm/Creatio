import {
	type CreationOptional,
	DataTypes,
	type ForeignKey,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";
import sequelize from "#api/config/db.ts";
import type { Genres } from "#types/domain/game.ts";
import User from "./User.ts";

class Game extends Model<InferAttributes<Game>, InferCreationAttributes<Game>> {
	declare id: string;
	declare title: string;
	declare description: CreationOptional<string | null>;
	declare genre: CreationOptional<Genres | null>;
	declare version: CreationOptional<string | null>;
	declare thumbnails: CreationOptional<Record<string, string> | null>;
	declare userId: ForeignKey<User["id"]>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

Game.init(
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		title: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.TEXT, allowNull: true },
		genre: { type: DataTypes.STRING, allowNull: true },
		version: { type: DataTypes.STRING, allowNull: true },
		thumbnails: { type: DataTypes.JSON, allowNull: true },
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: { model: User, key: "id" },
			onDelete: "CASCADE",
		},
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{ sequelize, timestamps: true, modelName: "Games" },
);

export default Game;
