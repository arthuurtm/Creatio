import Minio from 'minio'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const bucketName = 'public'

function getMinioClient() {
  const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: process.env.NODE_ENV === 'production',
    accessKey: process.env.MINIO_USER,
    secretKey: process.env.MINIO_PASSWORD,
  })

  // Garante que o bucket exista
  minioClient.bucketExists(bucketName, (err, exists) => {
    if (err) return console.error('Erro ao verificar bucket:', err)
    if (!exists) {
      minioClient.makeBucket(bucketName, 'us-east-1', (err) => {
        if (err) return console.error('Erro ao criar bucket:', err)
        console.log('Bucket criado com sucesso!')
      })
    } else {
      console.log('Bucket já existe.')
    }
  })

  return minioClient
}

async function uploadFilesToMinio(files, gameId) {
  if (!files || !files.length) {
    throw new Error('Nenhum arquivo enviado.')
  }

  const minioClient = getMinioClient()
  const uploadResults = []

  for (const file of files) {
    const minioFileName = uuidv4()

    try {
      await new Promise((resolve, reject) => {
        minioClient.fPutObject(
          bucketName,
          minioFileName,
          file.path,
          { 'Content-Type': file.mimetype },
          (err, etag) => {
            // Apaga o arquivo temporário
            fs.unlink(file.path, (unlinkErr) => {
              if (unlinkErr) console.error('Erro ao apagar arquivo temporário:', unlinkErr)
            })

            if (err) return reject(err)
            resolve(etag)
          },
        )
      })

      // Atualiza o banner do jogo no banco
      await Game.update({ banner: minioFileName }, { where: { id: gameId } })

      uploadResults.push({ file: file.originalname, status: 'sucesso' })
    } catch (err) {
      console.error(`Erro ao enviar ${file.originalname}:`, err)
      uploadResults.push({ file: file.originalname, status: 'erro', erro: err.message })
    }
  }

  return uploadResults
}

export { uploadFilesToMinio }
