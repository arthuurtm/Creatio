import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      collate: 'utf8mb4_unicode_ci',
    },
    birthdate: { type: DataTypes.DATEONLY, allowNull: false },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    nickname: { type: DataTypes.STRING, allowNull: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    profilePic: { type: DataTypes.TEXT, allowNull: true },
  },
  { timestamps: true },
)

export default User
