import { EventType } from '../models/index.js';

// Récupérer tous les types d'événements
export const getAllEventTypes = async (req, res) => {
  try {
    const eventTypes = await EventType.findAll({
      order: [['name', 'ASC']]
    });
    res.json(eventTypes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des types d\'événements', error: error.message });
  }
};

// Récupérer un type d'événement par son ID
export const getEventTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const eventType = await EventType.findByPk(id);
    
    if (!eventType) {
      return res.status(404).json({ message: 'Type d\'événement non trouvé' });
    }
    
    res.json(eventType);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du type d\'événement', error: error.message });
  }
};

// Récupérer tous les événements d'un type
export const getEventTypeEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const eventType = await EventType.findByPk(id, {
      include: [
        { 
          association: 'events',
          include: [
            { association: 'venue' },
            { association: 'organizer' },
            { association: 'artists' }
          ] 
        }
      ]
    });
    
    if (!eventType) {
      return res.status(404).json({ message: 'Type d\'événement non trouvé' });
    }
    
    res.json(eventType.events);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des événements du type', error: error.message });
  }
};

// Créer un nouveau type d'événement
export const createEventType = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const eventType = await EventType.create({
      name,
      description
    });
    
    res.status(201).json({ 
      id: eventType.id,
      message: 'Type d\'événement créé avec succès',
      eventType
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Un type d\'événement avec ce nom existe déjà',
        errors: [{ field: 'name', message: 'Ce nom est déjà utilisé' }]
      });
    }
    res.status(500).json({ message: 'Erreur lors de la création du type d\'événement', error: error.message });
  }
};

// Mettre à jour un type d'événement
export const updateEventType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const eventType = await EventType.findByPk(id);
    if (!eventType) {
      return res.status(404).json({ message: 'Type d\'événement non trouvé' });
    }
    
    const fieldsToUpdate = {};
    
    if (req.body.name !== undefined) fieldsToUpdate.name = req.body.name;
    if (req.body.description !== undefined) fieldsToUpdate.description = req.body.description;
    
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }
    
    await eventType.update(fieldsToUpdate);
    
    const updatedEventType = await EventType.findByPk(id);
    
    res.json({ 
      message: 'Type d\'événement mis à jour avec succès',
      eventType: updatedEventType
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Un type d\'événement avec ce nom existe déjà',
        errors: [{ field: 'name', message: 'Ce nom est déjà utilisé' }]
      });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour du type d\'événement', error: error.message });
  }
};

// Supprimer un type d'événement
export const deleteEventType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const eventType = await EventType.findByPk(id);
    if (!eventType) {
      return res.status(404).json({ message: 'Type d\'événement non trouvé' });
    }
    
    await eventType.destroy();
    
    res.json({ message: 'Type d\'événement supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du type d\'événement', error: error.message });
  }
};