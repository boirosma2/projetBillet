import request from 'supertest';
import express from 'express';
import { City } from '../models/index.js';
import citiesRoutes from '../routes/cities.js';
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
  const mockCity = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
  
  return {
    City: mockCity
  };
});

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/cities', citiesRoutes);

describe('Cities Routes', () => {
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

  describe('GET /api/cities', () => {
    it('should return a list of cities', async () => {
      // Mock de findAll pour retourner un tableau de villes
      const mockCities = [
        {
          id: 1,
          name: 'Paris',
          country: 'France'
        },
        {
          id: 2,
          name: 'London',
          country: 'UK'
        }
      ];
      
      City.findAll.mockResolvedValue(mockCities);
      
      const response = await request(app).get('/api/cities');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(City.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/cities/:id', () => {
    it('should return a single city with its venues', async () => {
      // Mock de findByPk pour retourner une ville
      const mockCity = {
        id: 1,
        name: 'Paris',
        country: 'France',
        venues: [
          { id: 1, name: 'Stade de France', address: 'Saint-Denis', capacity: 80000 }
        ]
      };
      
      City.findByPk.mockResolvedValue(mockCity);
      
      const response = await request(app).get('/api/cities/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Paris');
      expect(response.body.venues).toBeDefined();
      expect(City.findByPk).toHaveBeenCalled();
      expect(City.findByPk.mock.calls[0][0]).toBe('1');
    });

    it('should return 404 if city not found', async () => {
      City.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/cities/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Ville non trouvée');
    });
  });

  describe('GET /api/cities/:id/events', () => {
    it('should return all events in a city', async () => {
      // Mock de findByPk pour retourner une ville avec ses lieux et événements
      const mockCity = {
        id: 1,
        name: 'Paris',
        country: 'France',
        venues: [
          { 
            id: 1, 
            name: 'Stade de France', 
            events: [
              {
                id: 1,
                title: 'Concert Rock',
                date: new Date().toISOString(),
                eventType: { id: 1, name: 'Concert' },
                organizer: { id: 1, name: 'Live Nation' },
                artists: [{ id: 1, name: 'Rock Band' }]
              }
            ]
          }
        ]
      };
      
      City.findByPk.mockResolvedValue(mockCity);
      
      const response = await request(app).get('/api/cities/1/events');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Concert Rock');
      expect(City.findByPk).toHaveBeenCalled();
    });

    it('should return 404 if city not found for events', async () => {
      City.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/cities/999/events');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Ville non trouvée');
    });
  });

  describe('POST /api/cities', () => {
    it('should create a new city', async () => {
      // Mock de create pour retourner une ville créée
      const newCity = {
        id: 3,
        name: 'Berlin',
        country: 'Germany'
      };
      
      City.create.mockResolvedValue(newCity);
      
      const response = await request(app)
        .post('/api/cities')
        .send({
          name: 'Berlin',
          country: 'Germany'
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body.city.id).toBe(3);
      expect(response.body.city.name).toBe('Berlin');
      expect(City.create).toHaveBeenCalled();
      expect(authMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /api/cities/:id', () => {
    it('should update an existing city', async () => {
      // Créer une ville originale avec une méthode update
      const originalCity = {
        id: 1,
        name: 'Paris',
        country: 'France',
        update: jest.fn().mockResolvedValue([1])
      };
      
      // Ville mise à jour à retourner après l'update
      const updatedCity = {
        id: 1,
        name: 'New Paris',
        country: 'France'
      };
      
      // Configurer le mock pour retourner d'abord l'original puis la ville mise à jour
      City.findByPk
        .mockResolvedValueOnce(originalCity)  // Premier appel - vérification
        .mockResolvedValueOnce(updatedCity);  // Deuxième appel - après mise à jour
      
      const response = await request(app)
        .put('/api/cities/1')
        .send({
          name: 'New Paris'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.city.name).toBe('New Paris');
      expect(City.findByPk).toHaveBeenCalled();
    });

    it('should return 404 if city to update not found', async () => {
      City.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/cities/999')
        .send({
          name: 'Unknown City'
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Ville non trouvée');
    });
  });

  describe('DELETE /api/cities/:id', () => {
    it('should delete a city', async () => {
      // Mock de findByPk pour vérifier si la ville existe
      City.findByPk.mockResolvedValue({
        id: 1,
        name: 'City to Delete',
        destroy: jest.fn().mockResolvedValue(true)
      });
      
      const response = await request(app).delete('/api/cities/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Ville supprimée avec succès');
      expect(City.findByPk).toHaveBeenCalledWith('1');
    });

    it('should return 404 if city to delete not found', async () => {
      City.findByPk.mockResolvedValue(null);
      
      const response = await request(app).delete('/api/cities/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Ville non trouvée');
    });
  });
});