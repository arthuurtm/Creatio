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

// Rota para upload
app.post('/upload', upload.single('arquivo'), (req, res) => {
  const file = req.file
  if (!file) return res.status(400).send('Nenhum arquivo enviado.')

  const minioFileName = file.originalname

  minioClient.fPutObject(
    bucketName,
    minioFileName,
    file.path,
    { 'Content-Type': file.mimetype },
    function (err, etag) {
      // Remove o arquivo temporário local
      fs.unlinkSync(file.path)

      if (err) {
        console.error(err)
        return res.status(500).send('Erro ao enviar para o MinIO.')
      }

      res.send(`Arquivo enviado para o MinIO com sucesso: ${minioFileName}`)
    },
  )
})

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`)
})
