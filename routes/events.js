import express from 'express';
import validate from '../middleware/validate.js';
import { createEventSchema, updateEventSchema } from '../validators/events.js';
import { authMiddleware } from '../middleware/auth.js';
import { Event } from '../models/index.js';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        { association: 'venue' },
        { association: 'organizer' },
        { association: 'eventType' },
        { association: 'artists' }
      ],
      order: [['date', 'ASC']] // Trier par date croissante
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Get a specific event by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id, {
      include: [
        { association: 'venue' },
        { association: 'organizer' },
        { association: 'eventType' },
        { association: 'artists' }
      ]
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
});

// Create a new event (requires authentication and validation)
router.post('/', authMiddleware, validate(createEventSchema), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      venue_id,
      organizer_id,
      event_type_id,
      total_tickets, 
      available_tickets, 
      price 
    } = req.body;

    // Utiliser Sequelize pour créer un nouvel événement
    const event = await Event.create({
      title,
      description,
      date,
      venue_id,
      organizer_id,
      event_type_id,
      total_tickets,
      available_tickets: available_tickets !== undefined ? available_tickets : total_tickets,
      price,
      status: 'upcoming'
    });

    // Retourner l'événement créé
    res.status(201).json({ 
      id: event.id, 
      message: 'Event created successfully', 
      event
    });
  } catch (error) {
    // Gérer les erreurs de validation Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Update an existing event (requires authentication and validation)
router.put('/:id', authMiddleware, validate(updateEventSchema), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'événement existe
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    
    // Mettre à jour uniquement les champs fournis
    const fieldsToUpdate = {};
    
    if (req.body.title !== undefined) fieldsToUpdate.title = req.body.title;
    if (req.body.description !== undefined) fieldsToUpdate.description = req.body.description;
    if (req.body.date !== undefined) fieldsToUpdate.date = req.body.date;
    if (req.body.venue_id !== undefined) fieldsToUpdate.venue_id = req.body.venue_id;
    if (req.body.organizer_id !== undefined) fieldsToUpdate.organizer_id = req.body.organizer_id;
    if (req.body.event_type_id !== undefined) fieldsToUpdate.event_type_id = req.body.event_type_id;
    if (req.body.total_tickets !== undefined) fieldsToUpdate.total_tickets = req.body.total_tickets;
    if (req.body.available_tickets !== undefined) fieldsToUpdate.available_tickets = req.body.available_tickets;
    if (req.body.price !== undefined) fieldsToUpdate.price = req.body.price;
    if (req.body.status !== undefined) fieldsToUpdate.status = req.body.status;
    
    // Si aucun champ n'est fourni pour la mise à jour
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }
    
    // Mettre à jour l'événement
    await event.update(fieldsToUpdate);
    
    // Récupérer l'événement mis à jour
    const updatedEvent = await Event.findByPk(id);
    
    res.json({ 
      message: 'Événement mis à jour avec succès', 
      event: updatedEvent
    });
  } catch (error) {
    // Gérer les erreurs de validation Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'événement', error: error.message });
  }
});

// Delete an event (requires authentication)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'événement existe
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    
    // Supprimer l'événement (Sequelize gérera la cascade de suppression si configurée)
    await event.destroy();
    
    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement', error: error.message });
  }
});

export default router;