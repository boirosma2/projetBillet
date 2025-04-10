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
import { Ticket, Event } from '../models/index.js'

const router = express.Router()

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware)

// Récupérer tous les utilisateurs (admin uniquement)
router.get('/', getAllUsers)

// Récupérer les tickets de l'utilisateur connecté
// IMPORTANT: les routes spécifiques doivent être définies AVANT les routes avec paramètres
router.get('/my/tickets', async (req, res) => {
  try {
    // Récupérer les tickets de l'utilisateur avec les informations sur les événements
    const tickets = await Ticket.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Event,
        as: 'event',
        attributes: ['id', 'title', 'date', 'price', 'available_tickets', 'status']
      }],
      order: [['created_at', 'DESC']]
    });
    
    res.json(tickets);
  } catch (error) {
    console.error(`Error fetching tickets for user ${req.user.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets', error: error.message });
  }
})

// Récupérer un utilisateur par ID (admin ou l'utilisateur lui-même)
router.get('/:id', getUserById)

// Mettre à jour un utilisateur (admin ou l'utilisateur lui-même)
router.put('/:id', validate(updateUserSchema), updateUser)

// Supprimer un utilisateur (admin uniquement)
router.delete('/:id', deleteUser)

// Changer le statut d'un utilisateur (admin uniquement)
router.patch('/:id/status', changeUserStatus)

// Récupérer les tickets d'un utilisateur spécifique (admin ou l'utilisateur lui-même)
router.get('/:id/tickets', getUserTickets)

export default router