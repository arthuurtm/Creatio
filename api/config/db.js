// Arquivo: database/index.js (ou onde preferir)

import { Sequelize } from 'sequelize'
import mariadb from 'mariadb'
import log from '../helpers/console.js'

async function initialize() {
  try {
    // garantir que o banco de dados exista
    const pool = mariadb.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    })

    let conn
    try {
      conn = await pool.getConnection()
      await conn.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci;`,
      )
      log.info('Database verificado/criado com sucesso!')
    } finally {
      if (conn) conn.release()
      // serviu apenas para criar o DB, fechado
      await pool.end()
    }

    // criar e autenticar a instância do Sequelize
    const sequelizeInstance = new Sequelize(
      process.env.DATABASE,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mariadb',
        logging: false, // não poluir o console
      },
    )

    // teste de conexão
    await sequelizeInstance.authenticate()
    log.success('Conexão com o Sequelize estabelecida com sucesso.')

    return sequelizeInstance
  } catch (error) {
    log.error('Não foi possível conectar ao banco de dados: ', error)
    process.exit(1)
  }
}

const sequelize = await initialize()

export default sequelize
