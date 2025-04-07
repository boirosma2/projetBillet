import request from 'supertest';
import express from 'express';
import { Artist, Event, EventArtist, sequelize } from '../models/index.js';
import artistsRoutes from '../routes/artists.js';
import { authMiddleware } from '../middleware/auth.js';

// Mock des middleware et modèles
jest.mock('../middleware/auth.js', () => ({
  authMiddleware: jest.fn((req, res, next) => {
    // Simuler un utilisateur authentifié
    req.user = { id: 1, email: 'test@example.com', role: 'admin' };
    next();
  })
}));

jest.mock('../models/index.js', () => {
  const mockArtist = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
  
  const mockEvent = {
    findByPk: jest.fn()
  };
  
  const mockEventArtist = {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
  
  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn()
  };
  
  const mockSequelize = {
    transaction: jest.fn().mockResolvedValue(mockTransaction)
  };
  
  return {
    Artist: mockArtist,
    Event: mockEvent,
    EventArtist: mockEventArtist,
    sequelize: mockSequelize
  };
});

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/artists', artistsRoutes);

describe('Artists Routes', () => {
  // Nettoyage des mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Nettoyage global après tous les tests
  afterAll(done => {
    jest.useRealTimers();
    setTimeout(() => {
      done();
    }, 100);
  });

  describe('GET /api/artists', () => {
    it('should return a list of artists', async () => {
      // Mock de findAll pour retourner un tableau d'artistes
      const mockArtists = [
        {
          id: 1,
          name: 'Rock Band',
          genre: 'Rock',
          bio: 'Famous rock band',
          image_path: '/uploads/rock_band.jpg'
        },
        {
          id: 2,
          name: 'Pop Star',
          genre: 'Pop',
          bio: 'Famous pop star',
          image_path: '/uploads/pop_star.jpg'
        }
      ];
      
      Artist.findAll.mockResolvedValue(mockArtists);
      
      const response = await request(app).get('/api/artists');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(Artist.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/artists/:id', () => {
    it('should return a single artist', async () => {
      // Mock de findByPk pour retourner un artiste
      const mockArtist = {
        id: 1,
        name: 'Rock Band',
        genre: 'Rock',
        bio: 'Famous rock band',
        image_path: '/uploads/rock_band.jpg'
      };
      
      Artist.findByPk.mockResolvedValue(mockArtist);
      
      const response = await request(app).get('/api/artists/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Rock Band');
      expect(Artist.findByPk).toHaveBeenCalled();
      expect(Artist.findByPk.mock.calls[0][0]).toBe('1');
    });

    it('should return 404 if artist not found', async () => {
      Artist.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/artists/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Artiste non trouvé');
    });
  });

  describe('GET /api/artists/:id/events', () => {
    it('should return all events for an artist', async () => {
      // Mock de findByPk pour vérifier si l'artiste existe
      Artist.findByPk
        .mockResolvedValueOnce({ id: 1, name: 'Rock Band' }) // Premier appel - vérification
        .mockResolvedValueOnce({ // Deuxième appel - avec les événements inclus
          id: 1,
          name: 'Rock Band',
          events: [
            {
              id: 1,
              title: 'Rock Concert',
              venue: { id: 1, name: 'Arena' },
              organizer: { id: 1, name: 'Live Nation' },
              eventType: { id: 1, name: 'Concert' }
            },
            {
              id: 2,
              title: 'Music Festival',
              venue: { id: 2, name: 'Park' },
              organizer: { id: 2, name: 'Festival Org' },
              eventType: { id: 2, name: 'Festival' }
            }
          ]
        });
      
      const response = await request(app).get('/api/artists/1/events');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].title).toBe('Rock Concert');
      expect(Artist.findByPk).toHaveBeenCalledTimes(2);
    });

    it('should return 404 if artist not found for events', async () => {
      Artist.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/artists/999/events');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Artiste non trouvé');
    });
  });

  describe('POST /api/artists', () => {
    it('should create a new artist', async () => {
      // Mock de create pour retourner un artiste créé
      const newArtist = {
        id: 3,
        name: 'New Artist',
        genre: 'Jazz',
        bio: 'Jazz musician',
        image_path: '/uploads/jazz_artist.jpg'
      };
      
      Artist.create.mockResolvedValue(newArtist);
      
      const response = await request(app)
        .post('/api/artists')
        .send({
          name: 'New Artist',
          genre: 'Jazz',
          bio: 'Jazz musician',
          image_path: '/uploads/jazz_artist.jpg'
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body.artist.id).toBe(3);
      expect(response.body.artist.name).toBe('New Artist');
      expect(Artist.create).toHaveBeenCalled();
      expect(authMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /api/artists/:id', () => {
    it('should update an existing artist', async () => {
      // Créer un artiste original avec une méthode update
      const originalArtist = {
        id: 1,
        name: 'Old Name',
        genre: 'Old Genre',
        bio: 'Old Bio',
        update: jest.fn().mockResolvedValue([1])
      };
      
      // Artiste mis à jour à retourner après l'update
      const updatedArtist = {
        id: 1,
        name: 'Updated Name',
        genre: 'Updated Genre',
        bio: 'Updated Bio'
      };
      
      // Configurer le mock pour retourner d'abord l'original puis l'artiste mis à jour
      Artist.findByPk
        .mockResolvedValueOnce(originalArtist)  // Premier appel - vérification
        .mockResolvedValueOnce(updatedArtist);  // Deuxième appel - après mise à jour
      
      const response = await request(app)
        .put('/api/artists/1')
        .send({
          name: 'Updated Name',
          genre: 'Updated Genre',
          bio: 'Updated Bio'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.artist.name).toBe('Updated Name');
      expect(Artist.findByPk).toHaveBeenCalled();
    });

    it('should return 404 if artist to update not found', async () => {
      Artist.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/artists/999')
        .send({
          name: 'Unknown Artist'
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Artiste non trouvé');
    });
  });

  describe('DELETE /api/artists/:id', () => {
    it('should delete an artist', async () => {
      // Mock de findByPk pour vérifier si l'artiste existe
      Artist.findByPk.mockResolvedValue({
        id: 1,
        name: 'Artist to Delete',
        destroy: jest.fn().mockResolvedValue(true)
      });
      
      const response = await request(app).delete('/api/artists/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Artiste supprimé avec succès');
      expect(Artist.findByPk).toHaveBeenCalledWith('1');
    });

    it('should return 404 if artist to delete not found', async () => {
      Artist.findByPk.mockResolvedValue(null);
      
      const response = await request(app).delete('/api/artists/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Artiste non trouvé');
    });
  });

  describe('POST /api/artists/events/:event_id', () => {
    it('should add an artist to an event', async () => {
      // Mock pour la transaction
      const mockTransaction = await sequelize.transaction();
      
      // Mock des vérifications d'existence
      Event.findByPk.mockResolvedValue({ id: 1, title: 'Concert' });
      Artist.findByPk.mockResolvedValue({ id: 2, name: 'Artist' });
      
      // Association n'existe pas encore
      EventArtist.findOne.mockResolvedValue(null);
      
      // Mock de la création d'association
      EventArtist.create.mockResolvedValue({
        id: 1,
        event_id: 1,
        artist_id: 2,
        position: 'Headliner',
        performance_time: '2025-01-01T20:00:00.000Z'
      });
      
      // Mock pour la récupération après création
      Event.findByPk.mockResolvedValue({
        id: 1,
        title: 'Concert',
        artists: [
          {
            id: 2,
            name: 'Artist',
            genre: 'Rock',
            EventArtist: {
              position: 'Headliner',
              performance_time: '2025-01-01T20:00:00.000Z'
            }
          }
        ]
      });
      
      const response = await request(app)
        .post('/api/artists/events/1')
        .send({
          artist_id: 2,
          position: 'Headliner',
          performance_time: '2025-01-01T20:00:00.000Z'
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('Artiste ajouté à l\'événement avec succès');
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(EventArtist.create).toHaveBeenCalled();
    });

    it('should return 404 if event not found', async () => {
      // Mock pour la transaction
      const mockTransaction = await sequelize.transaction();
      
      // L'événement n'existe pas
      Event.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/artists/events/999')
        .send({
          artist_id: 1,
          position: 'Headliner'
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Événement non trouvé');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should return 404 if artist not found', async () => {
      // Mock pour la transaction
      const mockTransaction = await sequelize.transaction();
      
      // L'événement existe mais pas l'artiste
      Event.findByPk.mockResolvedValue({ id: 1, title: 'Concert' });
      Artist.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/artists/events/1')
        .send({
          artist_id: 999,
          position: 'Headliner'
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Artiste non trouvé');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should return 400 if association already exists', async () => {
      // Mock pour la transaction
      const mockTransaction = await sequelize.transaction();
      
      // L'événement et l'artiste existent
      Event.findByPk.mockResolvedValue({ id: 1, title: 'Concert' });
      Artist.findByPk.mockResolvedValue({ id: 1, name: 'Artist' });
      
      // L'association existe déjà
      EventArtist.findOne.mockResolvedValue({ 
        id: 1, 
        event_id: 1, 
        artist_id: 1 
      });
      
      const response = await request(app)
        .post('/api/artists/events/1')
        .send({
          artist_id: 1,
          position: 'Headliner'
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Cet artiste est déjà associé à cet événement');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/artists/events/:event_id/:artist_id', () => {
    it('should remove an artist from an event', async () => {
      // L'association existe
      EventArtist.findOne.mockResolvedValue({
        id: 1,
        event_id: 1,
        artist_id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      });
      
      const response = await request(app).delete('/api/artists/events/1/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Artiste retiré de l\'événement avec succès');
    });

    it('should return 404 if association not found', async () => {
      // L'association n'existe pas
      EventArtist.findOne.mockResolvedValue(null);
      
      const response = await request(app).delete('/api/artists/events/1/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Association artiste-événement non trouvée');
    });
  });

  describe('PUT /api/artists/events/:event_id/:artist_id', () => {
    it('should update artist details in an event', async () => {
      // L'association existe avec une méthode update
      const originalEventArtist = {
        id: 1,
        event_id: 1,
        artist_id: 1,
        position: 'Support',
        performance_time: '2025-01-01T19:00:00.000Z',
        update: jest.fn().mockResolvedValue([1])
      };
      
      // Association mise à jour pour la réponse
      const updatedEventArtist = {
        id: 1,
        event_id: 1,
        artist_id: 1,
        position: 'Headliner',
        performance_time: '2025-01-01T21:00:00.000Z',
        artist: { id: 1, name: 'Artist' },
        event: { id: 1, title: 'Concert' }
      };
      
      EventArtist.findOne
        .mockResolvedValueOnce(originalEventArtist)  // Premier appel - vérification
        .mockResolvedValueOnce(updatedEventArtist);  // Deuxième appel - après mise à jour
      
      const response = await request(app)
        .put('/api/artists/events/1/1')
        .send({
          position: 'Headliner',
          performance_time: '2025-01-01T21:00:00.000Z'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.eventArtist.position).toBe('Headliner');
      expect(EventArtist.findOne).toHaveBeenCalledTimes(2);
    });

    it('should return 404 if association not found', async () => {
      // L'association n'existe pas
      EventArtist.findOne.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/artists/events/1/999')
        .send({
          position: 'Headliner'
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Association artiste-événement non trouvée');
    });

    it('should return 400 if no fields to update', async () => {
      // L'association existe
      EventArtist.findOne.mockResolvedValue({
        id: 1,
        event_id: 1,
        artist_id: 1
      });
      
      const response = await request(app)
        .put('/api/artists/events/1/1')
        .send({});
      
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Aucun champ à mettre à jour');
    });
  });
});