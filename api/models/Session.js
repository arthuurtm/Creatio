import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'
import User from './User.js'

const Session = sequelize.define(
  'Session',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    accessToken: { type: DataTypes.STRING, allowNull: false },
    refreshToken: { type: DataTypes.STRING, allowNull: false },
    deviceOS: { type: DataTypes.STRING },
    deviceNavigator: { type: DataTypes.STRING },
    deviceGenerics: { type: DataTypes.JSON },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  { timestamps: true },
)

export default Session
