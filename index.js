import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import db from './config/db.js'
import authRoutes from './routes/auth.js'
import eventsRoutes from './routes/events.js'
import ticketsRoutes from './routes/tickets.js'
import bannersRoutes from './routes/banners.js'

// Chemin pour le fichier swagger.yaml
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Charger les variables d'environnement
dotenv.config()

const app = express()

// Middlewares
app.use(cors())
app.use(helmet({
  crossOriginResourcePolicy: false // Pour permettre l'accès aux fichiers statiques depuis un autre domaine
}))
app.use(express.json())
app.use(morgan('dev'))

// Servir les fichiers statiques
app.use('/uploads', express.static(join(__dirname, 'public/uploads')))

// Limitation de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite 100 requêtes par IP
})
app.use(limiter)

// Chargement du fichier Swagger
const swaggerDocument = YAML.load(join(__dirname, 'swagger.yaml'))

// Documentation API avec Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/tickets', ticketsRoutes)
app.use('/api/banners', bannersRoutes)

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
      console.log(`Documentation API disponible sur http://localhost:${PORT}/api-docs`)
    })
  } catch (error) {
    console.error('Erreur de démarrage du serveur:', error)
  }
}

startServer()
