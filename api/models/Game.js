import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js'

const Game = sequelize.define(
  'Game',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    genre: { type: DataTypes.STRING },
    banner: { type: DataTypes.TEXT },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  { timestamps: true },
)

export default Game
