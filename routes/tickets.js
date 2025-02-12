import express from 'express'
import db from '../config/db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Acheter un ticket
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { event_id } = req.body
    
    // Vérification cruciale : s'assurer que req.user.id existe
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' })
    }

    const user_id = req.user.id

    // Vérifier la disponibilité de l'événement
    const event = await db.get('SELECT * FROM events WHERE id = ?', [event_id])
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' })
    }

    if (event.available_tickets <= 0) {
      return res.status(400).json({ message: 'Aucun ticket disponible' })
    }

    // Vérifier si l'utilisateur a déjà acheté ce ticket
    const existingTicket = await db.get(
      'SELECT * FROM tickets WHERE event_id = ? AND user_id = ?', 
      [event_id, user_id]
    )

    if (existingTicket) {
      return res.status(400).json({ message: 'Vous avez déjà acheté un ticket pour cet événement' })
    }

    // Créer le ticket
    const result = await db.run(
      'INSERT INTO tickets (event_id, user_id) VALUES (?, ?)',
      [event_id, user_id]
    )

    // Mettre à jour les tickets disponibles
    await db.run(
      'UPDATE events SET available_tickets = available_tickets - 1 WHERE id = ?',
      [event_id]
    )

    res.status(201).json({ 
      id: result.lastID, 
      message: 'Ticket acheté avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de l\'achat du ticket:', error)
    res.status(500).json({ 
      message: 'Erreur lors de l\'achat du ticket', 
      error: error.message 
    })
  }
})

// Autres routes...

export default router
