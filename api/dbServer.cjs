const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize('dbSysroot', 'root', process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'mariadb',
});

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  username: {type: DataTypes.STRING, allowNull: true},
  passwordHash: { type: DataTypes.STRING, allowNull: false },
});

const Session = sequelize.define('Session', {
  sessionId: { type: DataTypes.STRING, allowNull: false },
  deviceInfo: { type: DataTypes.STRING },
  ipAddress: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

const EmailRequest = sequelize.define('EmailRequest', {
  email: { type: DataTypes.STRING, allowNull: false },
  dataEnvio: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  totalEnvios: { type: DataTypes.INTEGER, defaultValue: 0 },
  periodoEnvio: { type: DataTypes.INTEGER, defaultValue: 60 * 60 * 6000 },
});

const Game = sequelize.define('Game', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  genre: { type: DataTypes.STRING },
  releaseDate: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
});

User.hasMany(EmailRequest);
EmailRequest.belongsTo(User);
User.hasMany(Session);
Session.belongsTo(User);
User.hasMany(Game);
Game.belongsTo(User);

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

// Rota de Login com Google
app.post('/check-user', async (req, res) => {
  const { email, deviceInfo, ipAddress } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

  const sessionId = uuidv4();
  const token = jwt.sign({ userId: user.id, sessionId }, 'secreta-chave', { expiresIn: '2h' });

  await Session.create({ sessionId, deviceInfo, ipAddress, userId: user.id });

  res.json(
    { 
      'token': sessionId,
      'exists': true
    }
  );
});

// Rota para obter informações do usuário
app.post('/obter-dados-usuario', async (req, res) => {

});

// Rota para verificar e registrar os envios de e-mail
app.post('/verificar-envio', async (req, res) => {
  const { email } = req.body;
  const limiteEnvios = 5;
  const intervaloEnvio = 60 * 60 * 12000; // 1 hora em milissegundos

  // Verificar se o e-mail já foi enviado antes e controlar a quantidade de envios
  const emailRequest = await EmailRequest.findOne({ where: { email } });

  if (emailRequest) {
    const tempoDesdeUltimoEnvio = Date.now() - emailRequest.dataEnvio.getTime();

    if (emailRequest.totalEnvios >= limiteEnvios && tempoDesdeUltimoEnvio < intervaloEnvio) {
      return res.status(400).send('Limite de envios atingido. Tente novamente em breve.');
    }

    if (tempoDesdeUltimoEnvio >= intervaloEnvio) {
      emailRequest.totalEnvios = 0; // Resetar contagem após o período de intervalo
    }

    emailRequest.totalEnvios++;
    emailRequest.dataEnvio = new Date();
    await emailRequest.save();
  } else {
    // Se não existir um registro, criar um novo
    await EmailRequest.create({ email, totalEnvios: 1 });
  }
});

// Rota para encontrar todos os jogos cadastrados
app.get('/encontrar-jogos', async (req, res) => {
  try {
    // Buscar todos os jogos no banco
    const games = await Game.findAll();  // Retorna todos os jogos cadastrados

    // Retorna os jogos encontrados
    if (games.length === 0) {
      return res.status(404).json({ message: 'Nenhum jogo encontrado' });
    }

    res.json(games);  // Retorna os jogos em formato JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao encontrar jogos' });
  }
});

app.post('/request-reset', (req, res) => {
  const email = req.body.email;
  const token = crypto.randomBytes(32).toString('hex'); // Gera um token aleatório
  resetTokens[token] = email;  // Armazena o token com o e-mail associado

  // Aqui você deveria enviar o token para o e-mail do usuário
  res.status(200).send({ message: 'Token de redefinição enviado para o seu e-mail.' });
});

app.get('/validate-reset-token', (req, res) => {
  const token = req.query.token;

  if (resetTokens[token]) {
    res.status(200).send({ message: 'Token válido.' });
  } else {
    res.status(400).send({ message: 'Token inválido ou expirado.' });
  }
});

app.post('/reset-password', (req, res) => {
  const { new_password, confirm_password } = req.body;
  const token = req.query.token;

  if (!resetTokens[token]) {
    return res.status(400).send({ message: 'Token inválido ou expirado.' });
  }

  // Aqui você pode atualizar a senha no banco de dados do usuário
  res.status(200).send({ message: 'Senha redefinida com sucesso!' });
});

const port = 3000;
app.listen(port, () => {
  console.log('.::: DATABASE BACKEND :::.');
  console.log(`Servidor rodando na porta ${port}\n`)
});

