import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import validate from '../middleware/validate.js'
import { purchaseTicketSchema } from '../validators/tickets.js'
import { Ticket, Event, User } from '../models/index.js'
import { sequelize } from '../config/database.js'

const router = express.Router()

// Acheter un ticket (avec validation)
router.post('/buy', authMiddleware, validate(purchaseTicketSchema), async (req, res) => {
  // Utiliser une transaction pour garantir l'intégrité des données
  const transaction = await sequelize.transaction();
  
  try {
    const { event_id } = req.body
    
    // Vérification cruciale : s'assurer que req.user.id existe
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' })
    }

    const user_id = req.user.id

    // Vérifier la disponibilité de l'événement (avec verrouillage pour éviter les conflits)
    const event = await Event.findByPk(event_id, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!event) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Événement non trouvé' })
    }

    if (event.available_tickets <= 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Aucun ticket disponible' })
    }

    // Vérifier si l'utilisateur a déjà acheté ce ticket
    const existingTicket = await Ticket.findOne({
      where: { 
        event_id: event_id,
        user_id: user_id
      },
      transaction
    });

    if (existingTicket) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Vous avez déjà acheté un ticket pour cet événement' })
    }

    // Créer le ticket
    const ticket = await Ticket.create({
      event_id,
      user_id,
      price_paid: event.price,
      status: 'paid',
      purchase_date: new Date()
    }, { transaction });

    // Mettre à jour les tickets disponibles
    event.available_tickets -= 1;
    await event.save({ transaction });

    // Valider la transaction
    await transaction.commit();

    res.status(201).json({ 
      id: ticket.id, 
      message: 'Ticket acheté avec succès',
      ticket
    })
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await transaction.rollback();
    console.error('Erreur lors de l\'achat du ticket:', error)
    res.status(500).json({ 
      message: 'Erreur lors de l\'achat du ticket', 
      error: error.message 
    })
  }
})

// Obtenir les tickets d'un utilisateur
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id
    
    // Utiliser les associations Sequelize pour joindre les données
    const tickets = await Ticket.findAll({
      where: { user_id },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'date', 'venue', 'price']
        }
      ],
      order: [[{ model: Event, as: 'event' }, 'date', 'ASC']]
    });
    
    res.json(tickets)
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error)
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des tickets', 
      error: error.message 
    })
  }
})

// Obtenir les détails d'un ticket spécifique
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    // Rechercher le ticket avec l'événement associé
    const ticket = await Ticket.findOne({
      where: { id },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'description', 'date', 'price', 'image_path', 'available_tickets']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    // Vérifier si le ticket existe
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    // Vérifier que le ticket appartient à l'utilisateur (sauf pour les admins)
    if (ticket.user_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé à ce ticket' });
    }
    
    res.json(ticket);
  } catch (error) {
    console.error('Erreur lors de la récupération du ticket:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération du ticket',
      error: error.message
    });
  }
});

export default router
