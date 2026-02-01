import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";
import sequelize from "#api/config/db.ts";
import { UserAttributes, UserCreationAttributes } from "@projeto/types";

export class User extends Model<UserAttributes, UserCreationAttributes> {
	declare id: CreationOptional<number>;
	declare email: string;
	declare birthdate: Date;
	declare username: string;
	declare nickname: string | null;
	declare passwordHash: string;
	declare profilePic: string | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

User.init(
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		email: { type: DataTypes.STRING, unique: true, allowNull: false },
		birthdate: { type: DataTypes.DATEONLY, allowNull: false },
		username: { type: DataTypes.STRING, unique: true, allowNull: false },
		nickname: { type: DataTypes.STRING, allowNull: true },
		passwordHash: { type: DataTypes.STRING, allowNull: false },
		profilePic: { type: DataTypes.TEXT, allowNull: true },
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{
		sequelize,
		modelName: "Users",
		timestamps: true,
	},
);

export default User;
