import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import db from './config/db.js'
import authRoutes from './routes/auth.js'
import eventsRoutes from './routes/events.js'
import ticketsRoutes from './routes/tickets.js'

// Charger les variables d'environnement
dotenv.config()

const app = express()

// Middlewares
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(morgan('dev'))

// Limitation de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite 100 requêtes par IP
})
app.use(limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/tickets', ticketsRoutes)

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Quelque chose s\'est mal passé' })
})

// Démarrage du serveur
const PORT = process.env.PORT || 3000

async function startServer() {
  try {
    // Connexion à la base de données
    await db.connect()
    
    app.listen(PORT, () => {
      console.log(`Serveur en cours d'exécution sur le port ${PORT}`)
    })
  } catch (error) {
    console.error('Erreur de démarrage du serveur:', error)
  }
}

startServer()
