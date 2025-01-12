const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const https = require('https');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

const httpOptions = {
  key: fs.readFileSync('./certificate/auto/key.pem'),
  cert: fs.readFileSync('./certificate/auto/cert.pem')
}

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://02a5-138-0-83-231.ngrok-free.app'
  ],
  credentials: true
};
const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'mariadb',
});

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  birthdate: { type: DataTypes.DATEONLY, allowNull: false },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  nickname: { type: DataTypes.STRING, allowNull: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  sessionToken: { type: DataTypes.STRING, allowNull: false }, // Novo campo para o token de sessão
});

const Session = sequelize.define('Session', {
  sessionId: { type: DataTypes.STRING, allowNull: false },
  sessionToken: { type: DataTypes.STRING, allowNull: false }, // Armazena o token do usuário no momento da criação
  deviceInfo: { type: DataTypes.STRING },
  ipAddress: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

const Game = sequelize.define('Game', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  genre: { type: DataTypes.STRING },
  releaseDate: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
});

const EmailCodeVerify = sequelize.define('EmailCodeVerify', {
  email: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.INTEGER, allowNull: false },
  token: { type: DataTypes.STRING, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
});

User.hasMany(EmailCodeVerify);
EmailCodeVerify.belongsTo(User);

User.hasMany(Session);
Session.belongsTo(User);
User.hasMany(Game);
Game.belongsTo(User);

sequelize.sync();

const generateRandomNumbers = () => {
  let numbers = '';
  for (let i = 0; i < 6; i++) {
    numbers += crypto.randomInt(0, 10);
  }
  return numbers;
};

async function createSession(user) {
  const sessionId = uuidv4();
  await Session.create({
    sessionId,
    sessionToken: user.sessionToken,
    createdAt: new Date(),
    userId: user.id,
  });
  console.warn('SessionID: ', sessionId);
  return sessionId;
}


app.post('/login', async (req, res) => {
  const { type, email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

  if (type === 'default') {
    try {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) return res.status(400).json({ message: 'Senha incorreta' });

      const sessionId = await createSession(user);
      res.status(200)
        .cookie('sessionId', sessionId, {
          httpOnly: true,
          // secure: process.env.NODE_ENV === 'production', // Apenas em HTTPS
          sameSite: 'Strict',
        })
        .json({ message: 'Sessão criada com sucesso' });

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }

  } else if (type === 'google') {
    try {
      const sessionId = await createSession(user);
      res.status(200)
        .cookie('sessionId', sessionId, {
          httpOnly: true,
          // secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
        })
        .json({ message: 'Sessão criada com sucesso' });

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
});


app.post('/logout', (req, res) => {
  res.clearCookie('sessionId', { path: '/' });
  res.status(200).json({ message: 'Usuário deslogado com sucesso' });
});


app.post('/check-user', async (req, res) => {
  const email = req.body?.email;
  const sessionId = req.cookies?.sessionId;

  if (!email && !sessionId) {
    return res.status(400).json({ message: 'É necessário fornecer um email ou sessionId' });
  }

  try {
    let user;

    if (sessionId) {
      token = await Session.findOne({ where: { sessionId } });
      if (token) {
        let sessionToken = token.sessionToken
        user = await User.findOne({ where: {sessionToken} })
      }

    } else if (email) {
      user = await User.findOne({ where: { email } });
    }

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const userData = {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      exists: true,
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});


app.post('/validate-user-session', async (req, res) => {

  try {

    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return res.status(400).json({ message: 'SessionId é obrigatório.' });
    }

    let step1 = await Session.findOne({where: { sessionId }});
    if (!step1) {
      return res.status(400).json({ message: 'Sessão não encontrada.' });
    }
    let session = step1.sessionToken;

    let step2 = await User.findOne({ where: { sessionToken: session } });
    if (!step2) {
      return res.status(400).json({ message: 'Sessão inválida.'});
    }

    res.status(200).json({ message: 'Sessão válida.'});

  } catch (error) {
    console.error('Erro ao validar a sessão:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});


app.post('/signup-generate-code', async (req, res) => {
  const { email } = req.body;

  try {
    const verificationCode = generateRandomNumbers();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora de validade
    const user = await User.findOne({ where: { email } });

    if (user) {
      return res.status(400).json({ message: 'Este e-mail já foi usado.', errCode: 'emailInUse' });
    }

    // Cria o código de verificação no banco de dados
    await EmailCodeVerify.create({ email, type: 2, token: verificationCode, expiresAt });

    // Envia o e-mail
    const sendEmailResponse = await fetch('http://localhost:3001/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structure_name: "signupVerifyEmail",
        variables: {
          to: email,
          subject: "Verifique seu e-mail",
          verificationCode: verificationCode
        }
      }),
    });

    if (!sendEmailResponse.ok) {
      const errorData = await sendEmailResponse.json();
      console.error('Erro ao enviar e-mail:', errorData.message);
      return res.status(400).json({ message: 'Erro ao enviar e-mail.', errCode: 'emailSendError' });
    }

    res.status(200).json({ message: 'E-mail enviado com sucesso.', verificationCode });
  } catch (error) {
    console.error('Erro no endpoint /signup-generate-code:', error);
    res.status(500).json({ message: 'Erro interno do servidor.', error: error.message });
  }
});


app.post('/signup', async (req, res) => {
  const { nickname, username, email, birthdate, password, verificationCode} = req.body;

  const currentDate = new Date();
  const birthDateObj = new Date(birthdate);
  const verifyEntry = await EmailCodeVerify.findOne({ where: { email, type: 2, token:verificationCode } });
  const usernameExists = await User.findOne({ where: { username } });

  if (!verifyEntry) {
    return res.status(400).json({ message: 'Código inválido', errCode: 'invalidCode' });
  } else if (new Date() > verifyEntry.expiresAt) {
    return res.status(400).json({ message: 'Código expirado.', errCode: 'invalidCode' });
  } else {
    console.log('Código válido. ---');
  }
  
  if (birthDateObj > currentDate) {
    return res.status(400).json({ message: 'A data de nascimento não pode ser no futuro', errCode: 'invalidDatebirth' });
  } else {
    console.log('Data de nascimento válida. ---');
  }

  if (usernameExists) {
    return res.status(400).json({ message: 'Nome de usuário já existe', errCode: 'usernameExists' });
  }
 
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const sessionToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      nickname,
      username,
      email,
      birthdate,
      passwordHash,
      sessionToken
    });
    return res.status(201).json({ message: 'Usuário criado com sucesso', user });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Erro ao criar o usuário', errCode: 'internalError' });
  }
});


app.post('/list-user-sessions', async (req, res) => {
  const { userId } = req.body;

  try {
    const sessions = await Session.findAll({ where: { userId } });

    if (!sessions.length) {
      return res.status(404).json({ message: 'Nenhuma sessão encontrada.' });
    }

    res.status(200).json(sessions);
  } catch (error) {
    console.error('Erro ao listar sessões:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});


app.post('/delete-session', async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await Session.findOne({ where: { sessionId } });

    if (!session) {
      return res.status(404).json({ message: 'Sessão não encontrada.' });
    }

    await session.destroy();
    res.status(200).json({ message: 'Sessão deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar sessão:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});


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


app.post('/generate-reset-token', async (req, res) => {
  const { email, userId, nickname } = req.body;

  try {
    // Gera o token de redefinição
    const resetToken = generateRandomNumbers();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora de validade

    // Salva o token no banco de dados (ou outro local)
    await EmailCodeVerify.create({ email, type: 1, token: resetToken, expiresAt });

    // Envia solicitação ao backend Python para disparar o e-mail
    const sendEmailResponse = await fetch('http://localhost:3001/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        structure_name: "resetPassword",
        variables: {
          username: nickname,
          to: email,
          subject: "Seu código para redefinir a senha",
          resetPasswordCode: resetToken
        }
      }),
    });

    // Verifica se o envio do e-mail foi bem-sucedido
    if (!sendEmailResponse.ok) {
      const errorData = await sendEmailResponse.json();
      console.error('Erro ao enviar e-mail:', errorData.message);
      res.status(500).json({ message: 'Erro ao enviar e-mail.' });
      return;
    }

    // Retorna resposta de sucesso
    res.status(200).json({ 
      message: 'Código de redefinição gerado e e-mail enviado com sucesso.',
    });

  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    res.status(500).json({ message: 'Erro ao processar a solicitação.' });
  }
});


app.post('/validate-reset-token', async (req, res) => {
  const { email, resetToken } = req.body;

  try {
    const resetEntry = await EmailCodeVerify.findOne({ where: { email, type: 1, token: resetToken } });

    if (!resetEntry || new Date() > resetEntry.expiresAt) {
      return res.status(400).json({ message: 'Código inválido ou expirado.' });
    }

    res.status(200).json({ message: 'Código válido.' });
  } catch (error) {
    console.error('Erro ao validar código:', error);
    res.status(500).json({ message: 'Erro ao validar o código.' });
  }
});


app.post('/reset-password', async (req, res) => {
  const { email, resetToken, newPassword } = req.body;

  try {
    const resetEntry = await EmailCodeVerify.findOne({ where: { email, type: 1, token: resetToken } });

    if (!resetEntry || new Date() > resetEntry.expiresAt) {
      return res.status(400).json({ message: 'Código inválido ou expirado.' });
    }

    // Atualizar a senha do usuário
    const user = await User.findOne({ where: { email } });
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const sessionToken = crypto.randomBytes(32).toString('hex');
    user.passwordHash = passwordHash;
    user.sessionToken = sessionToken;
    await user.save();

    // Excluir o token usado
    await resetEntry.destroy();

    res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro ao redefinir a senha:', error);
    res.status(500).json({ message: 'Erro ao redefinir a senha.' });
  }
});


const port = 3000;
app.listen(port, () => {
  console.log('.::: DATABASE BACKEND :::.');
  console.log(`Servidor rodando na porta ${port}\n`)
});
// https.createServer(httpOptions, app).listen(port, () => {
//   console.log('.::: DATABASE BACKEND :::.');
//   console.log(`Servidor rodando na porta ${port}\n`)
// });

