import type {
	ProjectAttributes,
	ProjectCreationAttributes,
} from "@projeto/types";
import {
	type CreationOptional,
	DataTypes,
	type ForeignKey,
	Model,
} from "sequelize";
import sequelize from "#api/config/db.ts";
import User from "./User.ts";

export class Project extends Model<
	ProjectAttributes,
	ProjectCreationAttributes
> {
	declare id: CreationOptional<number>;
	declare title: string;
	declare description: CreationOptional<string | null>;
	declare version: CreationOptional<string | null>;
	declare thumbnails: CreationOptional<string[] | null>;
	declare userId: ForeignKey<User["id"]>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

Project.init(
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		title: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.TEXT, allowNull: true },
		version: { type: DataTypes.STRING, allowNull: true },
		thumbnails: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: { model: User, key: "id" },
			onDelete: "CASCADE",
		},
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{ sequelize, timestamps: true, modelName: "Projects" },
);

export default Project;
