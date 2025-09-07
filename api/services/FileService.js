import * as Minio from 'minio'
import fs from 'fs/promises'
import fscb from 'fs'
import path from 'path'
import os from 'os'
import { v4 as uuidv4 } from 'uuid'
import log from '../helpers/console.js'

const DEFAULT_BUCKET = process.env.MINIO_BUCKET || 'public'
const REGION = 'us-east-1'
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost'
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000', 10)
const MINIO_USE_SSL = process.env.NODE_ENV === 'production'
const CONCURRENCY_LIMIT = parseInt(process.env.FILE_SERVICE_CONCURRENCY || '3', 10) // uploads simultâneos

const minioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: process.env.MINIO_USER,
  secretKey: process.env.MINIO_PASSWORD,
})

/**
 * --- FILA e DEBOUNCE ---
 * queue: Map<key, { lastPayload, opts }>
 * cada "key" pode representar um jogo (game_123) ou um arquivo específico.
 * A ideia: quando vários updates chegarem pro mesmo key, só manteremos o último
 * e enviaremos uma gravação periódica (debounce).
 */
const queue = new Map()
let flushTimer = null

/**
 * Controle simples de concorrência para uploads ao MinIO
 */
let activeUploads = 0
const uploadWaiters = []

function _acquireUploadSlot() {
  if (activeUploads < CONCURRENCY_LIMIT) {
    activeUploads++
    return Promise.resolve()
  }
  return new Promise((resolve) => uploadWaiters.push(resolve))
}

function _releaseUploadSlot() {
  activeUploads--
  if (uploadWaiters.length > 0) {
    activeUploads++
    const next = uploadWaiters.shift()
    next()
  }
}

/**
 * Gera um caminho temporário a partir de um nome (usado quando precisamos escrever em disco)
 */
function tmpFilePath(pref = 'file') {
  return path.join(os.tmpdir(), `${pref}-${uuidv4()}`)
}

/**
 * ensureBucket - cria bucket se não existir (chamar na inicialização idealmente)
 */
async function ensureBucket(bucket = DEFAULT_BUCKET) {
  try {
    const exists = await new Promise((resolve, reject) => {
      minioClient.bucketExists(bucket, (err, exists) => {
        if (err) return reject(err)
        resolve(exists)
      })
    })

    if (!exists) {
      await new Promise((resolve, reject) => {
        minioClient.makeBucket(bucket, REGION, (err) => {
          if (err) return reject(err)
          resolve()
        })
      })

      // Se for bucket "public", aplica policy de leitura
      if (bucket === 'public') {
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        }
        await minioClient.setBucketPolicy(bucket, JSON.stringify(policy))
        log.success('Sucesso ao criar bucket: ', bucket)
      }
    }
  } catch (err) {
    log.error('Erro ao criar/verificar bucket:', err)
    throw err
  }
}

/**
 * utility: cria uma URL pública simples (se necessário)
 */
function buildPublicUrl(bucket = DEFAULT_BUCKET, objectName) {
  const protocol = MINIO_USE_SSL ? 'https' : 'http'
  return `http://localhost:5173/assets/${bucket}/${objectName}`
}

/**
 * flushQueue
 * - processa a fila atual (envia cada último payload para MinIO)
 * - para cada entrada:
 *    - calcula objectName (usando opts.objectNameGenerator ou key)
 *    - chama saveFileImmediate para executar o upload
 *    - resolve as Promises retornadas por queueSave
 */
async function _flushQueue() {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }

  if (queue.size === 0) return

  // snapshot da fila atual e limpamos a fila (novos updates vão criar novas entradas)
  const entries = Array.from(queue.entries())
  queue.clear()

  const promises = entries.map(async ([key, entry]) => {
    log.success('Processando fila para key:', { key, entry })
    const { payload, opts = {} } = entry
    const objectName =
      opts.objectNameGenerator && typeof opts.objectNameGenerator === 'function'
        ? opts.objectNameGenerator(key, payload)
        : opts.objectName || key || uuidv4()

    try {
      const savedName = await _saveFileImmediate({
        bucket: opts.bucket || DEFAULT_BUCKET,
        objectName,
        data: payload,
        meta: opts.meta || {},
      })

      // resolve todas as promises pendentes deste key
      if (entry._resolvers) {
        for (const r of entry._resolvers) r.resolve(savedName)
      }
      return { key, objectName: savedName, ok: true }
    } catch (err) {
      if (entry._resolvers) {
        for (const r of entry._resolvers) r.reject(err)
      }
      return { key, error: err.message || String(err), ok: false }
    }
  })

  // esperar todas completarem (respeitando limite de concorrência interno em upload)
  return Promise.all(promises)
}

/**
 * uploadBufferOrStream - envia para MinIO a partir de um Buffer ou Stream
 * retorna o objectName usado no bucket
 */
async function _uploadBufferOrStream(bucket, objectName, source, meta = {}) {
  await _acquireUploadSlot()
  try {
    // putObject aceita Buffer, Stream ou string
    return await new Promise((resolve, reject) => {
      minioClient.putObject(bucket, objectName, source, meta, (err, etag) => {
        if (err) return reject(err)
        resolve(objectName)
      })
    })
  } finally {
    _releaseUploadSlot()
  }
}

/**
 * uploadFilePath - usa fPutObject para enviar um arquivo já escrito no disco
 */
async function _uploadFilePath(bucket, objectName, filePath, meta = {}) {
  await _acquireUploadSlot()
  try {
    return await new Promise((resolve, reject) => {
      minioClient.fPutObject(bucket, objectName, filePath, meta, (err, etag) => {
        if (err) return reject(err)
        resolve(objectName)
      })
    })
  } finally {
    _releaseUploadSlot()
  }
}

/**
 * saveFileImmediate(options)
 * - salva IMEDIATAMENTE um "arquivo" no MinIO.
 * - options:
 *    - bucket (opcional)
 *    - objectName (opcional) -> se não vier, geramos um uuid
 *    - data -> pode ser:
 *        * Buffer
 *        * Readable Stream
 *        * string contendo caminho local (path)
 *        * JS Object (será JSON.stringified)
 *    - meta -> metadata para MinIO (content-type etc)
 *
 * retorna: objectName (nome do arquivo no bucket)
 */
async function _saveFileImmediate({
  bucket = DEFAULT_BUCKET,
  objectName = null,
  data,
  meta = {},
} = {}) {
  if (!data) throw new Error('saveFileImmediate: data é obrigatório')

  const name = objectName || uuidv4()

  // caso: JS object => stringify para Buffer
  if (typeof data === 'object' && !Buffer.isBuffer(data) && !data.pipe) {
    const json = JSON.stringify(data)
    const buffer = Buffer.from(json, 'utf8')
    if (!meta['Content-Type'] && !meta['content-type']) meta['Content-Type'] = 'application/json'
    await ensureBucket(bucket)
    await _uploadBufferOrStream(bucket, name, buffer, meta)
    return name
  }

  // caso: Buffer ou string (path) ou stream
  await ensureBucket(bucket)

  if (Buffer.isBuffer(data) || typeof data.pipe === 'function') {
    // Buffer ou Stream
    return await _uploadBufferOrStream(bucket, name, data, meta)
  }

  if (typeof data === 'string') {
    // assumimos path para arquivo local
    // verificamos se existe
    try {
      await fs.access(data)
    } catch (err) {
      throw new Error(`saveFileImmediate: arquivo local não encontrado: ${data}`)
    }
    // fPutObject precisa de path
    return await _uploadFilePath(bucket, name, data, meta)
  }

  throw new Error('saveFileImmediate: tipo de data não suportado')
}

const write = {
  /**
   * queueSave(key, payload, opts)
   * - key: identificador lógico (ex: game_123_state) → tudo que chegar com o mesmo key
   *   vai sobrescrever a entrada pendente, e só o último será salvo quando o debounce disparar.
   * - payload: mesmo formato aceito por saveFileImmediate.data (objeto | buffer | stream | path)
   * - opts: { bucket, objectNameGenerator, meta, debounceMs }
   *    - objectNameGenerator: função (key)=>objectName  // opcional se quer customizar nome final
   *    - debounceMs: tempo em ms para agrupar (default 1000)
   *
   * Retorna uma promise que resolve com o objectName quando a gravação for feita (após flush).
   */
  queueSave: (key, payload, opts = {}) => {
    const { debounceMs = 1000 } = opts

    // registra/atualiza a entrada pendente
    queue.set(key, { payload, opts })

    // agenda flush se não estiver agendado
    if (!flushTimer) {
      flushTimer = setTimeout(
        () =>
          _flushQueue().catch((e) => {
            // log simples, não quebrou a aplicação
            log.error('Erro em flushQueue:', e)
          }),
        debounceMs,
      )
    }

    // retorna uma Promise que será resolvida quando o flush realizar o upload
    return new Promise((resolve, reject) => {
      // guardamos resolvers dentro do objeto da fila para chamar depois
      const entry = queue.get(key) || {}
      entry._resolvers = entry._resolvers || []
      entry._resolvers.push({ resolve, reject })
      queue.set(key, entry)
    })
  },
}

const read = {
  getFile: async (bucket = 'public', fileName) => {
    await ensureBucket(bucket)

    if (bucket === 'public') {
      const stream = await minioClient.getObject(bucket, fileName)
      return { type: 'stream', file: stream }
    } else {
      const url = await new Promise((resolve, reject) => {
        minioClient.presignedGetObject(bucket, fileName, 60 * 60, (err, url) => {
          if (err) return reject(err)
          resolve(url)
        })
      })
      return { type: 'url', file: url }
    }
  },

  readJson: async (bucket, fileName) => {
    const stream = await minioClient.getObject(bucket, fileName)

    return new Promise((resolve, reject) => {
      let data = ''
      stream.on('data', (chunk) => {
        data += chunk.toString()
      })
      stream.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (err) {
          reject(err)
        }
      })
      stream.on('error', reject)
    })
  },
}

export default { write, read }
