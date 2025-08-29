import * as Minio from 'minio'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import log from '../helpers/console.js'

const bucketName = 'public'
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: process.env.NODE_ENV === 'production',
  accessKey: process.env.MINIO_USER,
  secretKey: process.env.MINIO_PASSWORD,
})

async function ensureBucket(bucket) {
  log.info('Entrei.....', bucket)
  return new Promise((resolve, reject) => {
    minioClient.bucketExists(bucket, (err, exists) => {
      if (err) return reject(err)
      if (!exists) {
        minioClient.makeBucket(bucket, 'us-east-1', (err) => {
          if (err) return reject(err)
          console.log(`Bucket ${bucket} criado.`)
          resolve()
        })
      } else {
        resolve()
      }
    })
  })
}

async function getFile(fileName, type = 'public') {
  const bucket = type === 'private' ? 'private' : 'public'

  await ensureBucket(bucket)

  if (type === 'public') {
    return `${minioClient.protocol}//${minioClient.host}:${minioClient.port}/${bucket}/${fileName}`
  } else {
    // Para arquivos privados → gera URL temporária
    return new Promise((resolve, reject) => {
      minioClient.presignedGetObject(bucket, fileName, 60 * 60, (err, url) => {
        if (err) return reject(err)
        resolve(url)
      })
    })
  }
}

async function uploadFiles(files, gameId) {
  if (!files || !files.length) {
    throw new Error('Nenhum arquivo enviado.')
  }

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

export { uploadFiles, getFile }
