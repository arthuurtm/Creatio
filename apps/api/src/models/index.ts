import sequelize from "#api/config/db.ts";
import Project from "./Project.ts";
import Session from "./Session.ts";
import User from "./User.ts";

User.hasMany(Session, {
	foreignKey: "userId",
	onDelete: "CASCADE",
});
Session.belongsTo(User, {
	foreignKey: "userId",
});

User.hasMany(Project, {
	foreignKey: "userId",
	onDelete: "CASCADE",
});
Project.belongsTo(User, {
	foreignKey: "userId",
});

sequelize.sync();

export { User, Session, Project };
