const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const sequelize = new Sequelize('nome_do_banco', 'usuario', 'senha', {
  host: 'localhost',
  dialect: 'mariadb',
});

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
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

// Rota de Registro
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, passwordHash });
    res.status(201).json({ message: 'Usuário registrado!', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar', error });
  }
});

// Rota de Login
app.post('/login', async (req, res) => {
  const { username, password, deviceInfo, ipAddress } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) return res.status(400).json({ message: 'Senha incorreta' });

  const sessionId = uuidv4();
  const token = jwt.sign({ userId: user.id, sessionId }, 'secreta-chave', { expiresIn: '2h' });

  await Session.create({ sessionId, deviceInfo, ipAddress, userId: user.id });

  res.json({ token, sessionId });
});

// Rota para listar sessões
app.get('/sessions', async (req, res) => {
  const { userId } = jwt.verify(req.headers.authorization, 'secreta-chave');
  const sessions = await Session.findAll({ where: { userId } });
  res.json(sessions);
});

// Rota para desconectar sessão
app.delete('/sessions/:sessionId', async (req, res) => {
  const { userId } = jwt.verify(req.headers.authorization, 'secreta-chave');
  const { sessionId } = req.params;
  await Session.destroy({ where: { sessionId, userId } });
  res.json({ message: 'Sessão desconectada' });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
