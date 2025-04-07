import { 
  Event, 
  Venue, 
  Organizer, 
  EventType, 
  Artist, 
  EventArtist
} from '../models/index.js';
import { sequelize } from '../config/database.js';

/**
 * Récupère tous les événements avec leurs relations
 */
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        { association: 'venue', include: ['city'] },
        { association: 'organizer' },
        { association: 'eventType' },
        { association: 'artists' }
      ],
      order: [['date', 'ASC']] // Trier par date croissante
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des événements', error: error.message });
  }
};

/**
 * Récupère un événement spécifique par son ID
 */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id, {
      include: [
        { association: 'venue', include: ['city'] },
        { association: 'organizer' },
        { association: 'eventType' },
        { 
          association: 'artists',
          through: {
            attributes: ['position', 'performance_time']
          }
        }
      ]
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    
    res.json(event);
  } catch (error) {
    console.error(`Error fetching event ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'événement', error: error.message });
  }
};

/**
 * Crée un nouvel événement
 */
export const createEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
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
      price,
      image_path,
      artists 
    } = req.body;

    // Vérifier si le lieu existe
    const venue = await Venue.findByPk(venue_id, { transaction });
    if (!venue) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Lieu non trouvé' });
    }

    // Vérifier si l'organisateur existe (si fourni)
    if (organizer_id) {
      const organizer = await Organizer.findByPk(organizer_id, { transaction });
      if (!organizer) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Organisateur non trouvé' });
      }
    }

    // Vérifier si le type d'événement existe (si fourni)
    if (event_type_id) {
      const eventType = await EventType.findByPk(event_type_id, { transaction });
      if (!eventType) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Type d\'événement non trouvé' });
      }
    }

    // Créer l'événement
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
      image_path,
      status: 'upcoming'
    }, { transaction });

    // Associer les artistes si fournis
    if (artists && artists.length > 0) {
      for (const artistData of artists) {
        // Vérifier que l'artiste existe
        const artist = await Artist.findByPk(artistData.artist_id, { transaction });
        if (!artist) {
          await transaction.rollback();
          return res.status(404).json({ 
            message: 'Artiste non trouvé', 
            artistId: artistData.artist_id 
          });
        }

        // Créer l'association avec les détails supplémentaires
        await EventArtist.create({
          event_id: event.id,
          artist_id: artistData.artist_id,
          position: artistData.position || null,
          performance_time: artistData.performance_time || null
        }, { transaction });
      }
    }

    await transaction.commit();

    // Récupérer l'événement avec toutes ses relations
    const createdEvent = await Event.findByPk(event.id, {
      include: [
        { association: 'venue', include: ['city'] },
        { association: 'organizer' },
        { association: 'eventType' },
        { 
          association: 'artists',
          through: {
            attributes: ['position', 'performance_time']
          }
        }
      ]
    });

    res.status(201).json({ 
      message: 'Événement créé avec succès', 
      event: createdEvent
    });
  } catch (error) {
    await transaction.rollback();
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'événement', error: error.message });
  }
};

/**
 * Met à jour un événement existant
 */
export const updateEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Vérifier si l'événement existe
    const event = await Event.findByPk(id, { transaction });
    if (!event) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    
    const { venue_id, organizer_id, event_type_id } = req.body;

    // Vérifier si le lieu existe (si fourni)
    if (venue_id) {
      const venue = await Venue.findByPk(venue_id, { transaction });
      if (!venue) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Lieu non trouvé' });
      }
    }

    // Vérifier si l'organisateur existe (si fourni)
    if (organizer_id) {
      const organizer = await Organizer.findByPk(organizer_id, { transaction });
      if (!organizer) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Organisateur non trouvé' });
      }
    }

    // Vérifier si le type d'événement existe (si fourni)
    if (event_type_id) {
      const eventType = await EventType.findByPk(event_type_id, { transaction });
      if (!eventType) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Type d\'événement non trouvé' });
      }
    }
    
    // Mettre à jour uniquement les champs fournis
    const fieldsToUpdate = {};
    
    if (req.body.title !== undefined) fieldsToUpdate.title = req.body.title;
    if (req.body.description !== undefined) fieldsToUpdate.description = req.body.description;
    if (req.body.date !== undefined) fieldsToUpdate.date = req.body.date;
    if (venue_id !== undefined) fieldsToUpdate.venue_id = venue_id;
    if (organizer_id !== undefined) fieldsToUpdate.organizer_id = organizer_id;
    if (event_type_id !== undefined) fieldsToUpdate.event_type_id = event_type_id;
    if (req.body.total_tickets !== undefined) fieldsToUpdate.total_tickets = req.body.total_tickets;
    if (req.body.available_tickets !== undefined) fieldsToUpdate.available_tickets = req.body.available_tickets;
    if (req.body.price !== undefined) fieldsToUpdate.price = req.body.price;
    if (req.body.image_path !== undefined) fieldsToUpdate.image_path = req.body.image_path;
    if (req.body.status !== undefined) fieldsToUpdate.status = req.body.status;
    
    // Si aucun champ n'est fourni pour la mise à jour
    if (Object.keys(fieldsToUpdate).length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }
    
    // Mettre à jour l'événement
    await event.update(fieldsToUpdate, { transaction });
    
    await transaction.commit();
    
    // Récupérer l'événement mis à jour avec toutes ses relations
    const updatedEvent = await Event.findByPk(id, {
      include: [
        { association: 'venue', include: ['city'] },
        { association: 'organizer' },
        { association: 'eventType' },
        { 
          association: 'artists',
          through: {
            attributes: ['position', 'performance_time']
          }
        }
      ]
    });
    
    res.json({ 
      message: 'Événement mis à jour avec succès', 
      event: updatedEvent
    });
  } catch (error) {
    await transaction.rollback();
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    console.error(`Error updating event ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'événement', error: error.message });
  }
};

/**
 * Supprime un événement
 */
export const deleteEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Vérifier si l'événement existe
    const event = await Event.findByPk(id, { transaction });
    if (!event) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    
    // Supprimer l'événement
    await event.destroy({ transaction });
    
    await transaction.commit();
    
    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    await transaction.rollback();
    console.error(`Error deleting event ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement', error: error.message });
  }
};

/**
 * Ajoute un artiste à un événement
 */
export const addArtistToEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params; // ID de l'événement
    const { artist_id, position, performance_time } = req.body;
    
    // Vérifier si l'événement existe
    const event = await Event.findByPk(id, { transaction });
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
      where: { event_id: id, artist_id },
      transaction
    });
    
    if (existingAssociation) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Cet artiste est déjà associé à cet événement' });
    }
    
    // Créer l'association
    await EventArtist.create({
      event_id: id,
      artist_id,
      position,
      performance_time
    }, { transaction });
    
    await transaction.commit();
    
    // Récupérer l'événement mis à jour avec l'artiste
    const updatedEvent = await Event.findByPk(id, {
      include: [
        { 
          association: 'artists',
          through: {
            attributes: ['position', 'performance_time']
          }
        }
      ]
    });
    
    // Trouver l'artiste ajouté dans la liste
    const addedArtist = updatedEvent.artists.find(a => a.id === artist_id);
    
    res.status(201).json({
      message: 'Artiste ajouté à l\'événement avec succès',
      artist: addedArtist
    });
  } catch (error) {
    await transaction.rollback();
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    console.error(`Error adding artist to event ${req.params.id}:`, error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'ajout de l\'artiste à l\'événement', 
      error: error.message 
    });
  }
};

/**
 * Met à jour les détails d'un artiste dans un événement
 */
export const updateEventArtist = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id, artist_id } = req.params;
    const { position, performance_time } = req.body;
    
    // Vérifier si l'association existe
    const eventArtist = await EventArtist.findOne({
      where: { event_id: id, artist_id },
      transaction
    });
    
    if (!eventArtist) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Association artiste-événement non trouvée' });
    }
    
    // Mettre à jour les champs fournis
    const fieldsToUpdate = {};
    
    if (position !== undefined) fieldsToUpdate.position = position;
    if (performance_time !== undefined) fieldsToUpdate.performance_time = performance_time;
    
    if (Object.keys(fieldsToUpdate).length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }
    
    await eventArtist.update(fieldsToUpdate, { transaction });
    
    await transaction.commit();
    
    // Récupérer l'événement mis à jour avec l'artiste
    const updatedEvent = await Event.findByPk(id, {
      include: [
        { 
          association: 'artists',
          where: { id: artist_id },
          required: false,
          through: {
            attributes: ['position', 'performance_time']
          }
        }
      ]
    });
    
    res.json({ 
      message: 'Détails de l\'artiste mis à jour avec succès',
      artist: updatedEvent.artists[0]
    });
  } catch (error) {
    await transaction.rollback();
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    console.error(`Error updating artist ${req.params.artist_id} in event ${req.params.id}:`, error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour des détails de l\'artiste', 
      error: error.message 
    });
  }
};

/**
 * Supprime un artiste d'un événement
 */
export const removeArtistFromEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id, artist_id } = req.params;
    
    // Vérifier si l'association existe
    const eventArtist = await EventArtist.findOne({
      where: { event_id: id, artist_id },
      transaction
    });
    
    if (!eventArtist) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Association artiste-événement non trouvée' });
    }
    
    // Supprimer l'association
    await eventArtist.destroy({ transaction });
    
    await transaction.commit();
    
    res.json({ message: 'Artiste retiré de l\'événement avec succès' });
  } catch (error) {
    await transaction.rollback();
    console.error(`Error removing artist ${req.params.artist_id} from event ${req.params.id}:`, error);
    res.status(500).json({ 
      message: 'Erreur lors du retrait de l\'artiste de l\'événement', 
      error: error.message 
    });
  }
};