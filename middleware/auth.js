import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const authMiddleware = (req, res, next) => {
  // Récupérer le token depuis l'en-tête Authorization
  const authHeader = req.header('Authorization')
  
  console.log('En-tête Authorization:', authHeader) // Log du token

  if (!authHeader) {
    return res.status(401).json({ message: 'Aucun token, autorisation refusée' })
  }

  // Extraire le token (en retirant "Bearer ")
  const token = authHeader.replace('Bearer ', '')

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      id: decoded.id,
      email: decoded.email
    }

    // Passer au middleware suivant
    next()
  } catch (error) {
    // Gérer les erreurs de token
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' })
    }
    return res.status(401).json({ message: 'Token invalide' })
  }
  
}

