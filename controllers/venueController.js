import { Venue, City } from '../models/index.js';

// Récupérer tous les lieux
export const getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.findAll({
      include: [{ association: 'city' }],
      order: [['name', 'ASC']]
    });
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des lieux', error: error.message });
  }
};

// Récupérer un lieu par son ID
export const getVenueById = async (req, res) => {
  try {
    const { id } = req.params;
    const venue = await Venue.findByPk(id, {
      include: [
        { association: 'city' },
        { association: 'events' }
      ]
    });
    
    if (!venue) {
      return res.status(404).json({ message: 'Lieu non trouvé' });
    }
    
    res.json(venue);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du lieu', error: error.message });
  }
};

// Récupérer tous les événements d'un lieu
export const getVenueEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const venue = await Venue.findByPk(id, {
      include: [
        { 
          association: 'events',
          include: [
            { association: 'eventType' },
            { association: 'organizer' },
            { association: 'artists' }
          ] 
        }
      ]
    });
    
    if (!venue) {
      return res.status(404).json({ message: 'Lieu non trouvé' });
    }
    
    res.json(venue.events);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des événements du lieu', error: error.message });
  }
};

// Créer un nouveau lieu
export const createVenue = async (req, res) => {
  try {
    const { name, address, city_id, capacity, description } = req.body;
    
    // Vérifier si la ville existe
    const city = await City.findByPk(city_id);
    if (!city) {
      return res.status(404).json({ message: 'Ville non trouvée' });
    }
    
    const venue = await Venue.create({
      name,
      address,
      city_id,
      capacity,
      description
    });
    
    res.status(201).json({ 
      id: venue.id,
      message: 'Lieu créé avec succès',
      venue
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({ message: 'Erreur lors de la création du lieu', error: error.message });
  }
};

// Mettre à jour un lieu
export const updateVenue = async (req, res) => {
  try {
    const { id } = req.params;
    
    const venue = await Venue.findByPk(id);
    if (!venue) {
      return res.status(404).json({ message: 'Lieu non trouvé' });
    }
    
    const fieldsToUpdate = {};
    
    if (req.body.name !== undefined) fieldsToUpdate.name = req.body.name;
    if (req.body.address !== undefined) fieldsToUpdate.address = req.body.address;
    if (req.body.city_id !== undefined) {
      // Vérifier si la ville existe
      const city = await City.findByPk(req.body.city_id);
      if (!city) {
        return res.status(404).json({ message: 'Ville non trouvée' });
      }
      fieldsToUpdate.city_id = req.body.city_id;
    }
    if (req.body.capacity !== undefined) fieldsToUpdate.capacity = req.body.capacity;
    if (req.body.description !== undefined) fieldsToUpdate.description = req.body.description;
    
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }
    
    await venue.update(fieldsToUpdate);
    
    const updatedVenue = await Venue.findByPk(id, {
      include: [{ association: 'city' }]
    });
    
    res.json({ 
      message: 'Lieu mis à jour avec succès',
      venue: updatedVenue
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour du lieu', error: error.message });
  }
};

// Supprimer un lieu
export const deleteVenue = async (req, res) => {
  try {
    const { id } = req.params;
    
    const venue = await Venue.findByPk(id);
    if (!venue) {
      return res.status(404).json({ message: 'Lieu non trouvé' });
    }
    
    await venue.destroy();
    
    res.json({ message: 'Lieu supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du lieu', error: error.message });
  }
};