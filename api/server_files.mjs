/* eslint-disable no-undef */
import express from 'express'
import multer from 'multer'
import * as Minio from 'minio'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

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

const app = express()
const port = 3003
const upload = multer({ storage })

const minioClient = new Minio.Client({
  endPoint: 'localhost', // ou IP do seu servidor
  port: 9000, // porta do MinIO
  useSSL: process.env.NODE_ENV === 'production', // true se usar HTTPS
  accessKey: process.env.MINIO_USER,
  secretKey: process.env.MINIO_PASSWORD,
})

console.log(process.env.MINIO_USER, process.env.MINIO_PASSWORD)

const bucketName = 'data'

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

app.post('/upload', upload.any(), async (req, res) => {
  const files = req.files || []

  // console.log('Arquivos recebidos:', files)

  if (!files.length) {
    return res.status(400).send({ message: 'Nenhum arquivo enviado.' })
  }

  const uploadResults = []

  for (const file of files) {
    const minioFileName = file.originalname

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

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`)
})
