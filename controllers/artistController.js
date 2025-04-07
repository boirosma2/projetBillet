import { Artist, Event, EventArtist } from '../models/index.js';
import { sequelize } from '../config/database.js';

// Récupérer tous les artistes
export const getAllArtists = async (req, res) => {
  try {
    const artists = await Artist.findAll({
      order: [['name', 'ASC']]
    });
    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des artistes', error: error.message });
  }
};

// Récupérer un artiste par son ID
export const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    const artist = await Artist.findByPk(id);
    
    if (!artist) {
      return res.status(404).json({ message: 'Artiste non trouvé' });
    }
    
    res.json(artist);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'artiste', error: error.message });
  }
};

// Récupérer tous les événements d'un artiste
export const getArtistEvents = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'artiste existe
    const artist = await Artist.findByPk(id);
    if (!artist) {
      return res.status(404).json({ message: 'Artiste non trouvé' });
    }
    
    // Récupérer les événements de l'artiste avec les détails des événements
    const artistWithEvents = await Artist.findByPk(id, {
      include: [
        { 
          association: 'events',
          include: [
            { association: 'venue' },
            { association: 'organizer' },
            { association: 'eventType' }
          ],
          through: { attributes: ['position', 'performance_time'] }
        }
      ]
    });
    
    res.json(artistWithEvents.events);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des événements de l\'artiste', error: error.message });
  }
};

// Créer un nouvel artiste
export const createArtist = async (req, res) => {
  try {
    const { name, genre, bio, image_path } = req.body;
    
    const artist = await Artist.create({
      name,
      genre,
      bio,
      image_path
    });
    
    res.status(201).json({ 
      id: artist.id,
      message: 'Artiste créé avec succès',
      artist
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({ message: 'Erreur lors de la création de l\'artiste', error: error.message });
  }
};

// Mettre à jour un artiste
export const updateArtist = async (req, res) => {
  try {
    const { id } = req.params;
    
    const artist = await Artist.findByPk(id);
    if (!artist) {
      return res.status(404).json({ message: 'Artiste non trouvé' });
    }
    
    const fieldsToUpdate = {};
    
    if (req.body.name !== undefined) fieldsToUpdate.name = req.body.name;
    if (req.body.genre !== undefined) fieldsToUpdate.genre = req.body.genre;
    if (req.body.bio !== undefined) fieldsToUpdate.bio = req.body.bio;
    if (req.body.image_path !== undefined) fieldsToUpdate.image_path = req.body.image_path;
    
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }
    
    await artist.update(fieldsToUpdate);
    
    const updatedArtist = await Artist.findByPk(id);
    
    res.json({ 
      message: 'Artiste mis à jour avec succès',
      artist: updatedArtist
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'artiste', error: error.message });
  }
};

// Supprimer un artiste
export const deleteArtist = async (req, res) => {
  try {
    const { id } = req.params;
    
    const artist = await Artist.findByPk(id);
    if (!artist) {
      return res.status(404).json({ message: 'Artiste non trouvé' });
    }
    
    await artist.destroy();
    
    res.json({ message: 'Artiste supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'artiste', error: error.message });
  }
};

// Ajouter un artiste à un événement
export const addArtistToEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { event_id } = req.params;
    const { artist_id, position, performance_time } = req.body;
    
    // Vérifier si l'événement existe
    const event = await Event.findByPk(event_id, { transaction });
    if (!event) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    
    // Vérifier si l'artiste existe
    const artist = await Artist.findByPk(artist_id, { transaction });
    if (!artist) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Artiste non trouvé' });
    }
    
    // Vérifier si l'association existe déjà
    const existingAssociation = await EventArtist.findOne({
      where: { event_id, artist_id },
      transaction
    });
    
    if (existingAssociation) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Cet artiste est déjà associé à cet événement' });
    }
    
    // Créer l'association
    const eventArtist = await EventArtist.create({
      event_id,
      artist_id,
      position,
      performance_time
    }, { transaction });
    
    await transaction.commit();
    
    // Récupérer les détails complets
    const eventWithArtist = await Event.findByPk(event_id, {
      include: [
        { 
          association: 'artists',
          where: { id: artist_id },
          required: false
        }
      ]
    });
    
    res.status(201).json({
      message: 'Artiste ajouté à l\'événement avec succès',
      eventArtist: eventWithArtist.artists[0]
    });
  } catch (error) {
    await transaction.rollback();
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Cet artiste est déjà associé à cet événement',
        errors: [{ field: 'artist_id', message: 'Association déjà existante' }]
      });
    }
    
    res.status(500).json({ 
      message: 'Erreur lors de l\'ajout de l\'artiste à l\'événement', 
      error: error.message 
    });
  }
};

// Supprimer un artiste d'un événement
export const removeArtistFromEvent = async (req, res) => {
  try {
    const { event_id, artist_id } = req.params;
    
    // Vérifier si l'association existe
    const eventArtist = await EventArtist.findOne({
      where: { event_id, artist_id }
    });
    
    if (!eventArtist) {
      return res.status(404).json({ message: 'Association artiste-événement non trouvée' });
    }
    
    await eventArtist.destroy();
    
    res.json({ message: 'Artiste retiré de l\'événement avec succès' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors du retrait de l\'artiste de l\'événement', 
      error: error.message 
    });
  }
};

// Mettre à jour les détails d'un artiste dans un événement
export const updateArtistInEvent = async (req, res) => {
  try {
    const { event_id, artist_id } = req.params;
    const { position, performance_time } = req.body;
    
    // Vérifier si l'association existe
    const eventArtist = await EventArtist.findOne({
      where: { event_id, artist_id }
    });
    
    if (!eventArtist) {
      return res.status(404).json({ message: 'Association artiste-événement non trouvée' });
    }
    
    // Mettre à jour les champs fournis
    const fieldsToUpdate = {};
    
    if (position !== undefined) fieldsToUpdate.position = position;
    if (performance_time !== undefined) fieldsToUpdate.performance_time = performance_time;
    
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }
    
    await eventArtist.update(fieldsToUpdate);
    
    // Récupérer l'association mise à jour
    const updatedEventArtist = await EventArtist.findOne({
      where: { event_id, artist_id },
      include: [
        { association: 'artist' },
        { association: 'event' }
      ]
    });
    
    res.json({ 
      message: 'Détails de l\'artiste dans l\'événement mis à jour avec succès',
      eventArtist: updatedEventArtist
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour des détails de l\'artiste dans l\'événement', 
      error: error.message 
    });
  }
};