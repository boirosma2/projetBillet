import { City } from '../models/index.js';

// Récupérer toutes les villes
export const getAllCities = async (req, res) => {
  try {
    const cities = await City.findAll({
      order: [['name', 'ASC']]
    });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des villes', error: error.message });
  }
};

// Récupérer une ville par son ID
export const getCityById = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findByPk(id, {
      include: [
        { association: 'venues' }
      ]
    });
    
    if (!city) {
      return res.status(404).json({ message: 'Ville non trouvée' });
    }
    
    res.json(city);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la ville', error: error.message });
  }
};

// Récupérer tous les événements d'une ville
export const getCityEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findByPk(id, {
      include: [
        { 
          association: 'venues',
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
        }
      ]
    });
    
    if (!city) {
      return res.status(404).json({ message: 'Ville non trouvée' });
    }
    
    // Extraire tous les événements de tous les lieux de la ville
    const events = city.venues.flatMap(venue => venue.events);
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des événements de la ville', error: error.message });
  }
};

// Créer une nouvelle ville
export const createCity = async (req, res) => {
  try {
    const { name, country } = req.body;
    
    const city = await City.create({
      name,
      country
    });
    
    res.status(201).json({ 
      id: city.id,
      message: 'Ville créée avec succès',
      city
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({ message: 'Erreur lors de la création de la ville', error: error.message });
  }
};

// Mettre à jour une ville
export const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const city = await City.findByPk(id);
    if (!city) {
      return res.status(404).json({ message: 'Ville non trouvée' });
    }
    
    const fieldsToUpdate = {};
    
    if (req.body.name !== undefined) fieldsToUpdate.name = req.body.name;
    if (req.body.country !== undefined) fieldsToUpdate.country = req.body.country;
    
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }
    
    await city.update(fieldsToUpdate);
    
    const updatedCity = await City.findByPk(id);
    
    res.json({ 
      message: 'Ville mise à jour avec succès',
      city: updatedCity
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la ville', error: error.message });
  }
};

// Supprimer une ville
export const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const city = await City.findByPk(id);
    if (!city) {
      return res.status(404).json({ message: 'Ville non trouvée' });
    }
    
    await city.destroy();
    
    res.json({ message: 'Ville supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la ville', error: error.message });
  }
};