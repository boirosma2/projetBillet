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
import { sequelize } from './config/database.js'
import authRoutes from './routes/auth.js'
import eventsRoutes from './routes/events.js'
import ticketsRoutes from './routes/tickets.js'
import citiesRoutes from './routes/cities.js'
import venuesRoutes from './routes/venues.js'
import organizersRoutes from './routes/organizers.js'
import eventTypesRoutes from './routes/eventTypes.js'
import artistsRoutes from './routes/artists.js'
import usersRoutes from './routes/users.js'
import bannersRoutes from './routes/banners.js'

// Importer les modèles pour s'assurer que les associations sont établies
import './models/index.js'

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

// Supprimé : servir les fichiers statiques (uploads)

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
app.use('/api/cities', citiesRoutes)
app.use('/api/venues', venuesRoutes)
app.use('/api/organizers', organizersRoutes)
app.use('/api/event-types', eventTypesRoutes)
app.use('/api/artists', artistsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/banners', bannersRoutes)

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(join(__dirname, 'public', 'uploads')))

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Quelque chose s\'est mal passé' })
})

// Démarrage du serveur
const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    // Tester la connexion à la base de données
    await sequelize.authenticate()
    console.log('Connexion à la base de données établie avec succès')
    
    app.listen(PORT, () => {
      console.log(`Serveur en cours d'exécution sur le port ${PORT}`)
      console.log(`Documentation API disponible sur http://localhost:${PORT}/api-docs`)
    })
  } catch (error) {
    console.error('Erreur de démarrage du serveur:', error)
    process.exit(1)
  }
}

startServer()
