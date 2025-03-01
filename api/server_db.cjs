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
	sessionToken: { type: DataTypes.STRING, allowNull: false },
	gToken: { type: DataTypes.STRING, unique: true, allowNull: true },
	profilePic: { type: DataTypes.STRING, allowNull: true },
});
  
const Session = sequelize.define('Session', {
	sessionId: { type: DataTypes.STRING, allowNull: false },
	sessionToken: { type: DataTypes.STRING, allowNull: false },
	deviceInfo: { type: DataTypes.STRING },
	ipAddress: { type: DataTypes.STRING },
	createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	userId: { 
	  type: DataTypes.INTEGER, 
	  allowNull: false, 
	  references: { model: 'Users', key: 'id' }, 
	  onDelete: 'CASCADE' 
	},
});
  
const Game = sequelize.define('Game', {
	title: { type: DataTypes.STRING, allowNull: false },
	description: { type: DataTypes.STRING },
	genre: { type: DataTypes.STRING },
	releaseDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	userId: { 
	  type: DataTypes.INTEGER, 
	  allowNull: false, 
	  references: { model: 'Users', key: 'id' }, 
	  onDelete: 'CASCADE' 
	},
});
  
const EmailCodeVerify = sequelize.define('EmailCodeVerify', {
	userId: { 
	  type: DataTypes.INTEGER, 
	  allowNull: true, 
	  references: { model: 'Users', key: 'id' }, 
	  onDelete: 'CASCADE' 
	},
	type: { type: DataTypes.INTEGER, allowNull: false },
	token: { type: DataTypes.STRING, allowNull: false },
	expiresAt: { type: DataTypes.DATE, allowNull: false },
});
  
User.hasMany(EmailCodeVerify, { foreignKey: 'userId' });
EmailCodeVerify.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Session, { foreignKey: 'userId' });
Session.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Game, { foreignKey: 'userId' });
Game.belongsTo(User, { foreignKey: 'userId' });
  
sequelize.sync();

function generateRandomNumbers() {
  let numbers = '';
  for (let i = 0; i < 6; i++) {
	numbers += crypto.randomInt(0, 10);
  }
  return numbers;
};

async function createUserSession(user) {
  const sessionId = uuidv4();
  await Session.create({
	sessionId,
	sessionToken: user.sessionToken,
	createdAt: new Date(),
	userId: user.id,
  });
  console.warn('SessionID: ', sessionId);
  return sessionId;
};

async function sendEmail(type, data = {}) {
	try {
		let bodyContent = {};

		// Resetar senha da conta
		if (type === 'resetPassSendCode') {

			await EmailCodeVerify.create({ userId: data.userId, type: 1, token: data.verificationCode, expiresAt: data.expiresAt });
			bodyContent = {
				structure_name: "resetPassword",
				variables: {
					username: data.nickname,
					to: data.email,
					subject: "Seu código para redefinir a senha",
					verificationCode: data.verificationCode
				}
			};

		// Código de verificação do cadastro
		} else if (type === 'signupSendCode') {

			await EmailCodeVerify.create({ type: 2, token: data.verificationCode, expiresAt: data.expiresAt });
			bodyContent = {
				structure_name: "signupVerifyEmail",
				variables: {
					to: data.email,
					subject: "Verifique seu e-mail",
					verificationCode: data.verificationCode
				}
			};
		};

		const response = await fetch('http://localhost:3001/send-email', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(bodyContent),
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Erro ao processar função sendMail: ', errorData.message);
			return false;
		} else {
			return true;
		};
	} catch (error) {
		console.error('Erro ao processar função sendEmail: ', error);
		return false;
	};
}

app.post('/getlogin', async (req, res) => {
	const { type, email, password, gToken } = req.body;

	try {
		let user = null;

		if (type === 'default') {
			user = await User.findOne({ where: { email } });
			if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

			const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
			if (!isPasswordValid) return res.status(400).json({ message: 'Senha incorreta' });

		} else if (type === 'google') {
			user = await User.findOne({ where: { gToken } });
			if (!user) return res.status(400).json({ message: 'Conta Google não vinculada a nenhuma conta.' });

		} else {
			return res.status(400).json({ message: 'Solicitação incorreta.' });
		};

		const sessionId = await createUserSession(user);

		res.status(200)
			.cookie('sessionId', sessionId, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'Strict',
			})
			.json({ message: 'Sessão criada com sucesso' });

	} catch (error) {
		console.error('Erro ao processar solicitação de getLogin:', error);
		res.status(500).json({ message: 'Erro interno no servidor' });
	};
});


// Logout
app.post('/logout', (req, res) => {
	res.clearCookie('sessionId', { path: '/' });
	res.status(200).json({ message: 'Usuário deslogado com sucesso' });
});


// Buscar dados básicos do usuário
app.post('/getUserBasics', async (req, res) => {
	const sessionId = req.cookies?.sessionId;
	const { userId } = req.body;

	if (!userId && !sessionId) {
		return res.status(400).json({ message: 'Solicitação inválida: forneça um ID ou sessão do usuário.' });
	};

	try {
		let user = null;

		if (sessionId) {
			const session = await Session.findOne({
				where: { sessionId },
				include: [{ model: User }]
			});
			user = session ? session.User : null;

		} else if (userId) {
			user = await User.findOne({ where: { id: userId } });
		};

		if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

		res.status(200).json({
			id: user.id,
			username: user.username,
			nickname: user.nickname,
			profilePic: user.profilePic,
			exists: true,
		});

	} catch (error) {
		console.error('Erro ao processar getBasicUserData:', error);
		res.status(500).json({ message: 'Erro interno no servidor' });
	};
});


// Verificar se a sessão é válida
app.post('/getUserSession', async (req, res) => {
	try {
		const sessionId = req.cookies?.sessionId;
		if (!sessionId) return res.status(400).json({ message: 'SessionId é obrigatório.' });

		const session = await Session.findOne({
			where: { sessionId },
			include: [{ model: User }]
		});

		if (!session || !session.User) {
			return res.status(400).json({ message: 'Sessão inválida ou não encontrada.' });
		};

		res.status(200).json({ message: 'Sessão válida.' });

	} catch (error) {
		console.error('Erro ao processar solcitação de getValidUserSession: ', error);
		res.status(500).json({ message: 'Erro interno do servidor.' });
	};
});


// Gerar e enviar código de verificação no e-mail para criação da conta
app.post('/setSignupCode', async (req, res) => {
	const { email } = req.body;

	try {
		// Verifica se já existe um usuário com o e-mail informado
		const user = await User.findOne({ where: { email } });
		if (user) {  // Se o usuário já existe, retorna o erro
			return res.status(400).json({ message: 'Este e-mail já foi usado.', errCode: 'emailInUse' });
		}

		// Caso o usuário não exista, continua o processo de envio do código
		const data = {
			email: email,
			verificationCode: generateRandomNumbers(),
			expiresAt: new Date(Date.now() + 3600000),  // A expiração do código
		};
		const emailSent = await sendEmail('signupSendCode', data);

		if (emailSent) {
			return res.status(200).json({ message: 'E-mail enviado com sucesso.' });
		} else {
			return res.status(500).json({ message: 'Erro ao enviar e-mail.', errCode: 'emailSendError' });
		};

	} catch (error) {
		console.error('Erro ao processar solicitação de setSignupCode:', error);
		return res.status(500).json({ message: 'Erro interno do servidor.', error: error.message });
	};
});


// Cadastrar novo usuário no Banco de Dados
app.post('/setUser', async (req, res) => {
	try {
		const { nickname, username, email, birthdate, password, verificationCode } = req.body;

		// Verifica se a data de nascimento é válida
		const currentDate = new Date();
		const birthDateObj = new Date(birthdate);
		if (isNaN(birthDateObj.getTime()) > currentDate) {
			return res.status(400).json({ message: 'A data de nascimento deve ser válida.', errCode: 'invalidDatebirth' });
		};

		// Executa consultas para recuperar o código de verificação e o nome de usuário
		const [verifyEntry, usernameExists] = await Promise.all([
			EmailCodeVerify.findOne({ where: { type: 2, token: verificationCode } }),
			User.findOne({ where: { username } })
		]);

		// Verifica código de verificação
		if (!verifyEntry) {
			return res.status(400).json({ message: 'Código de verificação inválido.', errCode: 'invalidCode' });
		} else if (new Date() > verifyEntry.expiresAt) {
			return res.status(400).json({ message: 'Código de verificação expirado.', errCode: 'invalidCode' });
		};

		// Verifica se o nome de usuário já está em uso
		if (usernameExists) {
			return res.status(400).json({ message: 'Nome de usuário já usado.', errCode: 'usernameExists' });
		};

		// Gera o hash da senha e o token da sessão
		const [passwordHash, sessionToken] = await Promise.all([
			bcrypt.hash(password, 10),
			uuidv4()
		]);

		// Cria o usuário no banco de dados
		const user = await User.create({
			nickname,
			username,
			email,
			birthdate,
			passwordHash,
			sessionToken
		});

		// Retorna sucesso
		return res.status(201).json({ message: 'Usuário criado com sucesso', user });

	} catch (error) {
		console.error('Erro ao processar solicitação de setUser:', error);
		return res.status(500).json({ message: 'Erro ao criar o usuário', errCode: 'internalError' });
	}
});


// Lista todas as sessões de um usuário
app.post('/getUserSessions', async (req, res) => {
  const { userId } = req.body;

  try {
	const sessions = await Session.findAll({ where: { userId } });

	if (!sessions.length) {
	  return res.status(404).json({ message: 'Nenhuma sessão encontrada.' });
	};

	res.status(200).json(sessions);
  } catch (error) {
	console.error('Erro ao listar sessões:', error);
	res.status(500).json({ message: 'Erro interno do servidor.' });
  };
});


// Deleta uma sessão específica, desconectando a mesma
app.post('/deleteSession', async (req, res) => {
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
	res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});


// Retornar todos os jogos disponíveis no site
app.get('/getGames', async (req, res) => {
  try {
	const games = await Game.findAll();
	if (games.length === 0) return res.status(404).json({ message: 'Nenhum jogo encontrado' });
	res.status(200).json(games);

  } catch (error) {
	console.error('Erro ao processar solicitação de getGames: ', error);
	res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});


// Gera um código de verificação e envia um e-mail para resetar a senha
app.post('/setResetPassCode', async (req, res) => {
  const { email } = req.body;

  try {

	const user = await User.findOne({where: email});
	const data = {
		email: email,
		userId: user.id,
		nickname: user.nickname,
		verificationCode: generateRandomNumbers(),
		expiresAt: new Date(Date.now() + 3600000),
	};

	const emailSent = await sendEmail('signupSendCode', data);
	if (emailSent) {
		return res.status(200).json({ message: 'Código de redefinição gerado e e-mail enviado com sucesso.' });
	} else {
		return res.status(500).json({ message: 'Erro ao enviar e-mail.', errCode: 'emailSendError' });
	};

  } catch (error) {
	console.error('Erro ao processar solicitação de setResetPassCode: ', error);
	res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});


// Recupera ao código e verifica se é válido
app.post('/getResetPassCode', async (req, res) => {
  const { userId, resetToken } = req.body;

  try {
	const resetEntry = await EmailCodeVerify.findOne({ where: { userId, type: 1, token: resetToken } });

	if (!resetEntry || new Date() > resetEntry.expiresAt) {
	  return res.status(400).json({ message: 'Código inválido ou expirado.' });
	}

	res.status(200).json({ message: 'Código válido.' });
  } catch (error) {
	console.error('Erro ao processar solicitação de getResetPassCode: ', error);
	res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});


// Define a nova senha do usuário
app.post('/setUserPassword', async (req, res) => {
  const { userId, resetToken, newPassword } = req.body;

  try {
	const resetEntry = await EmailCodeVerify.findOne({ where: { userId, type: 1, token: resetToken } });

	if (!resetEntry || new Date() > resetEntry.expiresAt) {
	  return res.status(400).json({ message: 'Código inválido ou expirado.' });
	}

	// Atualizar a senha do usuário
	const user = await User.findOne({ where: { userId } });
	const passwordHash = await bcrypt.hash(newPassword, 10);
	const sessionToken = crypto.randomBytes(32).toString('hex');
	user.passwordHash = passwordHash;
	user.sessionToken = sessionToken;
	await user.save();

	// Excluir o token usado
	await resetEntry.destroy();

	res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
	console.error('Erro ao processar solicitação de setUserPassword: ', error);
	res.status(500).json({ message: 'Erro interno no servidor.' });
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

