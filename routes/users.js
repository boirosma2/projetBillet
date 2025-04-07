import express from 'express'
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  changeUserStatus, 
  getUserTickets 
} from '../controllers/userController.js'
import { authMiddleware } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { updateUserSchema } from '../validators/auth.js'

const router = express.Router()

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware)

// Récupérer tous les utilisateurs (admin uniquement)
router.get('/', getAllUsers)

// Récupérer un utilisateur par ID (admin ou l'utilisateur lui-même)
router.get('/:id', getUserById)

// Mettre à jour un utilisateur (admin ou l'utilisateur lui-même)
router.put('/:id', validate(updateUserSchema), updateUser)

// Supprimer un utilisateur (admin uniquement)
router.delete('/:id', deleteUser)

// Changer le statut d'un utilisateur (admin uniquement)
router.patch('/:id/status', changeUserStatus)

// Récupérer les tickets d'un utilisateur (admin ou l'utilisateur lui-même)
router.get('/:id/tickets', getUserTickets)

export default router