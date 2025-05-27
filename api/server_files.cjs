/* eslint-disable no-undef */
const express = require('express')
const multer = require('multer')
const Minio = require('minio')
const fs = require('fs')
require('dotenv').config({ path: '../.env' })

const app = express()
const port = 3003
const upload = multer({ dest: multer.memoryStorage })

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
  const files = req.files

  console.log('Arquivos recebidos:', files)

  if (!files || files.length === 0) {
    return res.status(400).send({ message: 'Nenhum arquivo enviado.' })
  }

  const uploadResults = []

  for (const file of files) {
    const minioFileName = file.originalname

    try {
      // Upload para o MinIO
      await new Promise((resolve, reject) => {
        minioClient.fPutObject(
          bucketName,
          minioFileName,
          file.path,
          { 'Content-Type': file.mimetype },
          function (err, etag) {
            // Apaga o arquivo local
            fs.unlinkSync(file.path)

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
