import request from 'supertest';
import express from 'express';
import { Venue, City } from '../models/index.js';
import venuesRoutes from '../routes/venues.js';
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
  const mockVenue = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
  
  const mockCity = {
    findByPk: jest.fn()
  };
  
  return {
    Venue: mockVenue,
    City: mockCity
  };
});

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/venues', venuesRoutes);

describe('Venues Routes', () => {
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

  describe('GET /api/venues', () => {
    it('should return a list of venues', async () => {
      // Mock de findAll pour retourner un tableau de lieux
      const mockVenues = [
        {
          id: 1,
          name: 'Stade de France',
          address: 'Avenue du Président Wilson, 93200 Saint-Denis',
          city_id: 1,
          capacity: 80000,
          description: 'Le plus grand stade de France',
          city: { id: 1, name: 'Paris', country: 'France' }
        },
        {
          id: 2,
          name: 'O2 Arena',
          address: 'Peninsula Square, London SE10 0DX',
          city_id: 2,
          capacity: 20000,
          description: 'Grande salle de concert à Londres',
          city: { id: 2, name: 'London', country: 'UK' }
        }
      ];
      
      Venue.findAll.mockResolvedValue(mockVenues);
      
      const response = await request(app).get('/api/venues');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(Venue.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/venues/:id', () => {
    it('should return a single venue with its city and events', async () => {
      // Mock de findByPk pour retourner un lieu
      const mockVenue = {
        id: 1,
        name: 'Stade de France',
        address: 'Avenue du Président Wilson, 93200 Saint-Denis',
        city_id: 1,
        capacity: 80000,
        description: 'Le plus grand stade de France',
        city: { id: 1, name: 'Paris', country: 'France' },
        events: [
          { id: 1, title: 'Concert Rock', date: new Date().toISOString() }
        ]
      };
      
      Venue.findByPk.mockResolvedValue(mockVenue);
      
      const response = await request(app).get('/api/venues/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Stade de France');
      expect(response.body.city).toBeDefined();
      expect(response.body.events).toBeDefined();
      expect(Venue.findByPk).toHaveBeenCalled();
      expect(Venue.findByPk.mock.calls[0][0]).toBe('1');
    });

    it('should return 404 if venue not found', async () => {
      Venue.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/venues/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Lieu non trouvé');
    });
  });

  describe('GET /api/venues/:id/events', () => {
    it('should return all events at a venue', async () => {
      // Mock de findByPk pour retourner un lieu avec ses événements
      const mockVenue = {
        id: 1,
        name: 'Stade de France',
        address: 'Avenue du Président Wilson, 93200 Saint-Denis',
        city_id: 1,
        capacity: 80000,
        events: [
          {
            id: 1,
            title: 'Concert Rock',
            date: new Date().toISOString(),
            eventType: { id: 1, name: 'Concert' },
            organizer: { id: 1, name: 'Live Nation' },
            artists: [{ id: 1, name: 'Rock Band' }]
          },
          {
            id: 2,
            title: 'Match de Football',
            date: new Date().toISOString(),
            eventType: { id: 2, name: 'Sport' },
            organizer: { id: 2, name: 'FFF' },
            artists: []
          }
        ]
      };
      
      Venue.findByPk.mockResolvedValue(mockVenue);
      
      const response = await request(app).get('/api/venues/1/events');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].title).toBe('Concert Rock');
      expect(response.body[1].title).toBe('Match de Football');
      expect(Venue.findByPk).toHaveBeenCalled();
    });

    it('should return 404 if venue not found for events', async () => {
      Venue.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/venues/999/events');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Lieu non trouvé');
    });
  });

  describe('POST /api/venues', () => {
    it('should create a new venue', async () => {
      // Mock findByPk de City pour vérifier si la ville existe
      City.findByPk.mockResolvedValue({ id: 1, name: 'Paris' });
      
      // Mock de create pour retourner un lieu créé
      const newVenue = {
        id: 3,
        name: 'Arena Bercy',
        address: '8 Boulevard de Bercy, 75012 Paris',
        city_id: 1,
        capacity: 15000,
        description: 'Salle de concert et d\'événements sportifs'
      };
      
      Venue.create.mockResolvedValue(newVenue);
      
      const response = await request(app)
        .post('/api/venues')
        .send({
          name: 'Arena Bercy',
          address: '8 Boulevard de Bercy, 75012 Paris',
          city_id: 1,
          capacity: 15000,
          description: 'Salle de concert et d\'événements sportifs'
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body.venue.id).toBe(3);
      expect(response.body.venue.name).toBe('Arena Bercy');
      expect(City.findByPk).toHaveBeenCalledWith(1);
      expect(Venue.create).toHaveBeenCalled();
      expect(authMiddleware).toHaveBeenCalled();
    });

    it('should return 404 if city not found for venue creation', async () => {
      City.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/venues')
        .send({
          name: 'Test Venue',
          address: 'Test Address',
          city_id: 999,
          capacity: 1000
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Ville non trouvée');
      expect(City.findByPk).toHaveBeenCalledWith(999);
      expect(Venue.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/venues/:id', () => {
    it('should update an existing venue', async () => {
      // Créer un lieu original avec une méthode update
      const originalVenue = {
        id: 1,
        name: 'Old Venue',
        address: 'Old Address',
        city_id: 1,
        capacity: 1000,
        update: jest.fn().mockResolvedValue([1])
      };
      
      // Lieu mis à jour à retourner après l'update
      const updatedVenue = {
        id: 1,
        name: 'New Venue Name',
        address: 'Old Address',
        city_id: 1,
        capacity: 1000,
        city: { id: 1, name: 'Paris' }
      };
      
      // Configurer le mock pour retourner d'abord l'original puis le lieu mis à jour
      Venue.findByPk
        .mockResolvedValueOnce(originalVenue)  // Premier appel - vérification
        .mockResolvedValueOnce(updatedVenue);  // Deuxième appel - après mise à jour
      
      const response = await request(app)
        .put('/api/venues/1')
        .send({
          name: 'New Venue Name'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.venue.name).toBe('New Venue Name');
      expect(Venue.findByPk).toHaveBeenCalled();
    });

    it('should check city existence when updating city_id', async () => {
      // Lieu original
      const originalVenue = {
        id: 1,
        name: 'Old Venue',
        city_id: 1,
        update: jest.fn().mockResolvedValue([1])
      };
      
      Venue.findByPk.mockResolvedValueOnce(originalVenue);
      City.findByPk.mockResolvedValue(null); // Ville non trouvée
      
      const response = await request(app)
        .put('/api/venues/1')
        .send({
          city_id: 999
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Ville non trouvée');
    });

    it('should return 404 if venue to update not found', async () => {
      Venue.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/venues/999')
        .send({
          name: 'Unknown Venue'
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Lieu non trouvé');
    });
  });

  describe('DELETE /api/venues/:id', () => {
    it('should delete a venue', async () => {
      // Mock de findByPk pour vérifier si le lieu existe
      Venue.findByPk.mockResolvedValue({
        id: 1,
        name: 'Venue to Delete',
        destroy: jest.fn().mockResolvedValue(true)
      });
      
      const response = await request(app).delete('/api/venues/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Lieu supprimé avec succès');
      expect(Venue.findByPk).toHaveBeenCalledWith('1');
    });

    it('should return 404 if venue to delete not found', async () => {
      Venue.findByPk.mockResolvedValue(null);
      
      const response = await request(app).delete('/api/venues/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Lieu non trouvé');
    });
  });
});