import sequelize from "#api/config/db.ts";
import Game from "./Game.ts";
import GameState from "./GameState.ts";
import Session from "./Session.ts";
import User from "./User.ts";

User.hasMany(Session, {
	foreignKey: "userId",
	onDelete: "CASCADE",
});
Session.belongsTo(User, {
	foreignKey: "userId",
	as: "user",
});

User.hasMany(Game, {
	foreignKey: "userId",
	onDelete: "CASCADE",
});
Game.belongsTo(User, {
	foreignKey: "userId",
});

User.hasMany(GameState, {
	foreignKey: "userId",
	as: "gameStates",
	onDelete: "CASCADE",
});
GameState.belongsTo(User, {
	foreignKey: "userId",
	as: "user",
});

Game.hasMany(GameState, {
	foreignKey: "gameId",
	as: "gameStates",
	onDelete: "CASCADE",
});
GameState.belongsTo(Game, {
	foreignKey: "gameId",
	as: "game",
});

sequelize.sync();

export { User, Session, Game, GameState };
