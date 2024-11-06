const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize('dbSysroot', 'root', '[*RO3(c06Iql.Kk/', {
  host: 'localhost',
  dialect: 'mariadb',
});

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
});

const Session = sequelize.define('Session', {
  sessionId: { type: DataTypes.STRING, allowNull: false },
  deviceInfo: { type: DataTypes.STRING },
  ipAddress: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

User.hasMany(Session);
Session.belongsTo(User);

sequelize.sync();

// Rota de Login
app.post('/login', async (req, res) => {
  const { email, password, deviceInfo, ipAddress } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) return res.status(400).json({ message: 'Senha incorreta' });

  const sessionId = uuidv4();
  const token = jwt.sign({ userId: user.id, sessionId }, 'secreta-chave', { expiresIn: '2h' });

  await Session.create({ sessionId, deviceInfo, ipAddress, userId: user.id });

  res.json({ token, sessionId });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
