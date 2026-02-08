import mysql from 'mysql2/promise'
import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2'
import { DatabaseConfig } from '../config/DatabaseConfig'

export class Database {
  private readonly pool: mysql.Pool
  private connection: MySql2Database | null = null

  constructor(private readonly config: DatabaseConfig) {
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database
    })
  }

  async connect() {
    if (this.connection) return this.connection

    const connection = await mysql.createConnection({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password
    })

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${this.config.database}\``)
    await connection.end()

    this.connection = drizzle(this.pool)

    return this.connection
  }

  get db() {
    if (!this.connection) {
      throw new Error('Database has not been connected yet')
    }

    return this.connection
  }
}