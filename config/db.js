import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class Database {
  constructor() {
    this.db = null
  }

  async connect() {
    try {
      this.db = await open({
        filename: path.resolve(__dirname, '../ticketing.db'),
        driver: sqlite3.Database
      })

      // Création des tables
      await this.createTables()
      console.log('Base de données initialisée avec succès')
    } catch (error) {
      console.error('Erreur d\'initialisation de la base de données:', error)
      throw error
    }
  }

  async createTables() {
    // Table Utilisateurs
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Table Événements
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date DATETIME NOT NULL,
        venue TEXT NOT NULL,
        total_tickets INTEGER NOT NULL,
        available_tickets INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL
      )
    `)

    // Table Tickets
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(event_id) REFERENCES events(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `)
  }

  async query(sql, params = []) {
    if (!this.db) await this.connect()
    return this.db.all(sql, params)
  }

  async get(sql, params = []) {
    if (!this.db) await this.connect()
    return this.db.get(sql, params)
  }

  async run(sql, params = []) {
    if (!this.db) await this.connect()
    return this.db.run(sql, params)
  }
}

export default new Database()
