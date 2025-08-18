import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Game from './Game.js';

const GameState = sequelize.define(
  'GameState',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    stateData: { type: DataTypes.JSON, allowNull: false },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: 'id' },
      onDelete: 'CASCADE',
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Game, key: 'id' },
      onDelete: 'CASCADE',
    },
    uniqueConstraint: {
      type: DataTypes.STRING,
      unique: 'user_game_unique', // Nome da restrição
    },
    saveVersion: { type: DataTypes.STRING, allowNull: true },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'gameId'], // Evita saves duplicados para o mesmo jogo+usuário
        name: 'user_game_unique',
      },
    ],
  },
)

export default GameState
