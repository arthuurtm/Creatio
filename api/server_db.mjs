/* eslint-disable no-undef */
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import * as Minio from 'minio'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp')
  },
  filename: (req, file, cb) => {
    // para evitar conflito, cria um nome único, ex: timestamp + nome original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  },
})

const upload = multer({ storage })
const bucketName = 'public'

const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: process.env.NODE_ENV === 'production',
  accessKey: process.env.MINIO_USER,
  secretKey: process.env.MINIO_PASSWORD,
})

minioClient.bucketExists(bucketName, (err, exists) => {
  if (err) return console.error(err)
  if (!exists) {
    minioClient.makeBucket(bucketName, 'us-east-1', (err) => {
      if (err) return console.error('Erro ao criar bucket:', err)
      console.log('Bucket criado com sucesso!')
    })
  } else {
    console.log('Bucket já existe.')
  }
})

async function sendEmail(type, data = {}) {
  try {
    let bodyContent = {}

    // Recuperar senha da conta
    if (type === 'resetPassSendCode') {
      await EmailCodeVerify.create({
        userId: data.userId,
        type: 1,
        token: data.verificationCode,
        expiresAt: data.expiresAt,
      })
      bodyContent = {
        variables: {
          structure_name: 'resetPassword',
          username: data.nickname,
          to: data.email,
          subject: 'Seu código para redefinir a senha',
          verificationCode: data.verificationCode,
        },
      }

      // Código de verificação do cadastro
    } else if (type === 'signupSendCode') {
      await EmailCodeVerify.create({
        type: 2,
        token: data.verificationCode,
        expiresAt: data.expiresAt,
      })
      bodyContent = {
        variables: {
          structure_name: 'signupVerifyEmail',
          to: data.email,
          subject: 'Verifique seu e-mail',
          verificationCode: data.verificationCode,
        },
      }

      // E-mail de confirmação que a senha foi enviada
    } else if (type === 'resetedPassword') {
      bodyContent = {
        variables: {
          structure_name: 'resetedPassword',
          to: data.email,
          username: data.nickname,
          subject: 'Senha alterada com sucesso',
        },
      }
    }

    const response = await fetch('http://localhost:3001/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyContent),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Erro ao processar função sendMail: ', errorData.message)
      return false
    } else {
      return true
    }
  } catch (error) {
    console.error('Erro ao processar função sendEmail: ', error)
    return false
  }
}

app.post('/setLogin', async (req, res) => {})
app.delete('/logout', (req, res) => {})
app.delete('/logoutAll', isAuthenticated, async (req, res) => {})
app.get('/getUserData', isAuthenticated, async (req, res) => {})
app.get('/getUserBasics', async (req, res) => {})
// Gerar e enviar código de verificação no e-mail para criação da conta
app.post('/setSignupCode', async (req, res) => {})
// Cadastrar novo usuário no Banco de Dados
app.post('/setUser', async (req, res) => {})

// Lista todas as sessões de um usuário
app.get('/getAllUserSessions', isAuthenticated, async (req, res) => {})

// Deleta uma sessão específica, desconectando a mesma
app.delete('/deleteSession', isAuthenticated, async (req, res) => {})

// Retornar todos os jogos disponíveis no site
app.get('/getGames', async (req, res) => {})

app.post('/setGame', reqLimiter(1, 12), isAuthenticated, async (req, res) => {})

// Gera um código de verificação e envia um e-mail para resetar a senha
app.post('/setResetPassCode', async (req, res) => {
  const { userId } = req.body

  try {
    const user = await User.findOne({ where: { id: userId } })
    const data = {
      email: user.email,
      userId: user.id,
      nickname: user.nickname,
      verificationCode: generateRandomNumbers(),
      expiresAt: new Date(Date.now() + 3600000),
    }

    const emailSent = await sendEmail('resetPassSendCode', data)
    if (emailSent) {
      return res
        .status(200)
        .json({ message: 'Código de redefinição gerado e e-mail enviado com sucesso' })
    } else {
      return res
        .status(500)
        .json({ message: 'Erro ao enviar e-mail', details: { errCode: 'emailSendError' } })
    }
  } catch (error) {
    console.error('Erro ao processar solicitação de setResetPassCode: ', error)
    res.status(500).json({ message: 'Erro interno no servidor' })
  }
})

// Recupera ao código e verifica se é válido
app.post('/getResetPassCode', async (req, res) => {
  const { userId, resetToken } = req.body

  try {
    const resetEntry = await EmailCodeVerify.findOne({
      where: { userId, type: 1, token: resetToken },
    })

    if (!resetEntry || new Date() > resetEntry.expiresAt) {
      return res
        .status(400)
        .json({ message: 'Código inválido ou expirado.', details: { errCode: 'invalidCode' } })
    }

    res.status(200).json({ message: 'Código válido.' })
  } catch (error) {
    console.error('Erro ao processar solicitação de getResetPassCode: ', error)
    res.status(500).json({ message: 'Erro interno no servidor.' })
  }
})

// Define a nova senha do usuário
app.post('/setUserPassword', async (req, res) => {
  const { userId, resetToken, newPassword } = req.body

  try {
    const resetEntry = await EmailCodeVerify.findOne({
      where: { userId, type: 1, token: resetToken },
    })

    if (!resetEntry || new Date() > resetEntry.expiresAt) {
      return res
        .status(400)
        .json({ message: 'Código inválido ou expirado.', details: { errCode: 'invalidCode' } })
    }

    // Atualizar a senha do usuário
    const user = await User.findOne({ where: { id: userId } })
    const passwordHash = await bcrypt.hash(newPassword, 10)
    const sessionToken = crypto.randomBytes(32).toString('hex')
    user.passwordHash = passwordHash
    user.sessionToken = sessionToken
    await user.save()

    // Excluir o token usado
    await resetEntry.destroy()

    const data = {
      email: user.email,
      nickname: user.nickname,
    }

    await sendEmail('resetedPassword', data)

    res.status(200).json({ message: 'Senha redefinida com sucesso!' })
  } catch (error) {
    console.error('Erro ao processar solicitação de setUserPassword: ', error)
    res.status(500).json({ message: 'Erro interno no servidor.' })
  }
})

app.post('/setFileUpload', isAuthenticated, upload.any(), async (req, res) => {
  const files = req.files || []
  if (!files.length) {
    return res.status(400).send({ message: 'Nenhum arquivo enviado.' })
  }

  const body = req.body || {}

  const uploadResults = []

  for (const file of files) {
    const minioFileName = uuidv4()
    try {
      await new Promise((resolve, reject) => {
        minioClient.fPutObject(
          bucketName,
          minioFileName,
          file.path, // caminho do arquivo temporário em /tmp
          { 'Content-Type': file.mimetype },
          (err, etag) => {
            // Apaga o arquivo temporário depois do upload
            fs.unlink(file.path, (unlinkErr) => {
              if (unlinkErr) console.error('Erro ao apagar arquivo temporário:', unlinkErr)
            })

            if (err) return reject(err)
            resolve(etag)
          },
        )
      })

      await Game.update({ banner: minioFileName }, { where: { id: body.gameId } })
      uploadResults.push({
        file: file.originalname,
        status: 'sucesso',
      })
    } catch (err) {
      console.error(`Erro ao enviar ${file.originalname}:`, err)
      uploadResults.push({
        file: file.originalname,
        status: 'erro',
        erro: err.message,
      })
    }
  }

  res.send({ message: 'Upload concluído.', resultados: uploadResults })
})
