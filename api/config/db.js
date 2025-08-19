import { Sequelize } from 'sequelize'
import mariadb from 'mariadb'
import log from '../helpers/console.js'

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

// cria banco se não existir
;(async () => {
  let conn
  try {
    conn = await pool.getConnection()
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DATABASE}\`;`, //CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci
    )
    log.info('Database verificado/criado com sucesso!')
  } catch(error) {
    log.error("Erro ao carregar o banco de dados: ", error)
  } finally {
    if (conn) conn.release()
  }
})()

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mariadb',
  },
)

export default sequelize
