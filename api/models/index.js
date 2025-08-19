import User from './User.js'
import Session from './Session.js'
import Game from './Game.js'
import GameState from './GameState.js'

User.hasMany(Session, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
})
Session.belongsTo(User, {
  foreignKey: 'userId',
})

User.hasMany(Game, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
})
Game.belongsTo(User, {
  foreignKey: 'userId',
})

User.hasMany(GameState, {
  foreignKey: 'userId',
  as: 'gameStates',
  onDelete: 'CASCADE',
})
GameState.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
})

Game.hasMany(GameState, {
  foreignKey: 'gameId',
  as: 'gameStates',
  onDelete: 'CASCADE',
})
GameState.belongsTo(Game, {
  foreignKey: 'gameId',
  as: 'game',
})

export { User, Session, Game, GameState }
