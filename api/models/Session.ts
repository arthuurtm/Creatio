import {
	type CreationOptional,
	DataTypes,
	type ForeignKey,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";
import sequelize from "#api/config/db.ts";
import type { DeviceData } from "#types/domain/index.ts";
import User from "./User.ts";

class Session extends Model<
	InferAttributes<Session>,
	InferCreationAttributes<Session>
> {
	declare id: CreationOptional<number>;
	declare accessToken: string;
	declare refreshToken: string;
	declare deviceData: DeviceData;
	declare userId: ForeignKey<User["id"]>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare User?: User;
}

Session.init(
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		accessToken: { type: DataTypes.TEXT, allowNull: false },
		refreshToken: { type: DataTypes.TEXT, allowNull: false },
		deviceData: { type: DataTypes.JSON },
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: { model: User, key: "id" },
			onDelete: "CASCADE",
		},
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{
		sequelize,
		timestamps: true,
		modelName: "Sessions",
	},
);

export default Session;
