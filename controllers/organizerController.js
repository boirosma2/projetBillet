import { Organizer } from '../models/index.js';

// Récupérer tous les organisateurs
export const getAllOrganizers = async (req, res) => {
  try {
    const organizers = await Organizer.findAll({
      order: [['name', 'ASC']]
    });
    res.json(organizers);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des organisateurs', error: error.message });
  }
};

// Récupérer un organisateur par son ID
export const getOrganizerById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizer = await Organizer.findByPk(id);
    
    if (!organizer) {
      return res.status(404).json({ message: 'Organisateur non trouvé' });
    }
    
    res.json(organizer);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'organisateur', error: error.message });
  }
};

// Récupérer tous les événements d'un organisateur
export const getOrganizerEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const organizer = await Organizer.findByPk(id, {
      include: [
        { 
          association: 'events',
          include: [
            { association: 'venue' },
            { association: 'eventType' },
            { association: 'artists' }
          ] 
        }
      ]
    });
    
    if (!organizer) {
      return res.status(404).json({ message: 'Organisateur non trouvé' });
    }
    
    res.json(organizer.events);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des événements de l\'organisateur', error: error.message });
  }
};

// Créer un nouvel organisateur
export const createOrganizer = async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    
    const organizer = await Organizer.create({
      name,
      email,
      bio
    });
    
    res.status(201).json({ 
      id: organizer.id,
      message: 'Organisateur créé avec succès',
      organizer
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({ message: 'Erreur lors de la création de l\'organisateur', error: error.message });
  }
};

// Mettre à jour un organisateur
export const updateOrganizer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const organizer = await Organizer.findByPk(id);
    if (!organizer) {
      return res.status(404).json({ message: 'Organisateur non trouvé' });
    }
    
    const fieldsToUpdate = {};
    
    if (req.body.name !== undefined) fieldsToUpdate.name = req.body.name;
    if (req.body.email !== undefined) fieldsToUpdate.email = req.body.email;
    if (req.body.bio !== undefined) fieldsToUpdate.bio = req.body.bio;
    
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }
    
    await organizer.update(fieldsToUpdate);
    
    const updatedOrganizer = await Organizer.findByPk(id);
    
    res.json({ 
      message: 'Organisateur mis à jour avec succès',
      organizer: updatedOrganizer
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'organisateur', error: error.message });
  }
};

// Supprimer un organisateur
export const deleteOrganizer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const organizer = await Organizer.findByPk(id);
    if (!organizer) {
      return res.status(404).json({ message: 'Organisateur non trouvé' });
    }
    
    await organizer.destroy();
    
    res.json({ message: 'Organisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'organisateur', error: error.message });
  }
};