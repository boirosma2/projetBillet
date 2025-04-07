import request from 'supertest';
import express from 'express';
import { Organizer } from '../models/index.js';
import organizersRoutes from '../routes/organizers.js';
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
  const mockOrganizer = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
  
  return {
    Organizer: mockOrganizer
  };
});

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/organizers', organizersRoutes);

describe('Organizers Routes', () => {
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

  describe('GET /api/organizers', () => {
    it('should return a list of organizers', async () => {
      // Mock de findAll pour retourner un tableau d'organisateurs
      const mockOrganizers = [
        {
          id: 1,
          name: 'Live Nation',
          email: 'contact@livenation.com',
          bio: 'Plus grand promoteur d\'événements au monde'
        },
        {
          id: 2,
          name: 'AEG Presents',
          email: 'contact@aegpresents.com',
          bio: 'Promoteur mondial d\'événements'
        }
      ];
      
      Organizer.findAll.mockResolvedValue(mockOrganizers);
      
      const response = await request(app).get('/api/organizers');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(Organizer.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/organizers/:id', () => {
    it('should return a single organizer', async () => {
      // Mock de findByPk pour retourner un organisateur
      const mockOrganizer = {
        id: 1,
        name: 'Live Nation',
        email: 'contact@livenation.com',
        bio: 'Plus grand promoteur d\'événements au monde'
      };
      
      Organizer.findByPk.mockResolvedValue(mockOrganizer);
      
      const response = await request(app).get('/api/organizers/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Live Nation');
      expect(Organizer.findByPk).toHaveBeenCalled();
      expect(Organizer.findByPk.mock.calls[0][0]).toBe('1');
    });

    it('should return 404 if organizer not found', async () => {
      Organizer.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/organizers/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Organisateur non trouvé');
    });
  });

  describe('GET /api/organizers/:id/events', () => {
    it('should return all events by an organizer', async () => {
      // Mock de findByPk pour retourner un organisateur avec ses événements
      const mockOrganizer = {
        id: 1,
        name: 'Live Nation',
        email: 'contact@livenation.com',
        bio: 'Plus grand promoteur d\'événements au monde',
        events: [
          {
            id: 1,
            title: 'Concert Rock',
            venue: { id: 1, name: 'Stade de France' },
            eventType: { id: 1, name: 'Concert' },
            artists: [{ id: 1, name: 'Rock Band' }]
          },
          {
            id: 2,
            title: 'Festival d\'été',
            venue: { id: 2, name: 'Parc des expositions' },
            eventType: { id: 2, name: 'Festival' },
            artists: [{ id: 2, name: 'Pop Star' }]
          }
        ]
      };
      
      Organizer.findByPk.mockResolvedValue(mockOrganizer);
      
      const response = await request(app).get('/api/organizers/1/events');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].title).toBe('Concert Rock');
      expect(Organizer.findByPk).toHaveBeenCalled();
    });

    it('should return 404 if organizer not found for events', async () => {
      Organizer.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/organizers/999/events');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Organisateur non trouvé');
    });
  });

  describe('POST /api/organizers', () => {
    it('should create a new organizer', async () => {
      // Mock de create pour retourner un organisateur créé
      const newOrganizer = {
        id: 3,
        name: 'New Promoter',
        email: 'contact@newpromoter.com',
        bio: 'Nouveau promoteur de concerts'
      };
      
      Organizer.create.mockResolvedValue(newOrganizer);
      
      const response = await request(app)
        .post('/api/organizers')
        .send({
          name: 'New Promoter',
          email: 'contact@newpromoter.com',
          bio: 'Nouveau promoteur de concerts'
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body.organizer.id).toBe(3);
      expect(response.body.organizer.name).toBe('New Promoter');
      expect(Organizer.create).toHaveBeenCalled();
      expect(authMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /api/organizers/:id', () => {
    it('should update an existing organizer', async () => {
      // Créer un organisateur original avec une méthode update
      const originalOrganizer = {
        id: 1,
        name: 'Old Promoter',
        email: 'old@example.com',
        bio: 'Old bio',
        update: jest.fn().mockResolvedValue([1])
      };
      
      // Organisateur mis à jour à retourner après l'update
      const updatedOrganizer = {
        id: 1,
        name: 'Updated Promoter',
        email: 'old@example.com',
        bio: 'Updated bio'
      };
      
      // Configurer le mock pour retourner d'abord l'original puis l'organisateur mis à jour
      Organizer.findByPk
        .mockResolvedValueOnce(originalOrganizer)  // Premier appel - vérification
        .mockResolvedValueOnce(updatedOrganizer);  // Deuxième appel - après mise à jour
      
      const response = await request(app)
        .put('/api/organizers/1')
        .send({
          name: 'Updated Promoter',
          bio: 'Updated bio'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.organizer.name).toBe('Updated Promoter');
      expect(response.body.organizer.bio).toBe('Updated bio');
      expect(Organizer.findByPk).toHaveBeenCalled();
    });

    it('should return 404 if organizer to update not found', async () => {
      Organizer.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/organizers/999')
        .send({
          name: 'Unknown Organizer'
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Organisateur non trouvé');
    });
  });

  describe('DELETE /api/organizers/:id', () => {
    it('should delete an organizer', async () => {
      // Mock de findByPk pour vérifier si l'organisateur existe
      Organizer.findByPk.mockResolvedValue({
        id: 1,
        name: 'Organizer to Delete',
        destroy: jest.fn().mockResolvedValue(true)
      });
      
      const response = await request(app).delete('/api/organizers/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Organisateur supprimé avec succès');
      expect(Organizer.findByPk).toHaveBeenCalledWith('1');
    });

    it('should return 404 if organizer to delete not found', async () => {
      Organizer.findByPk.mockResolvedValue(null);
      
      const response = await request(app).delete('/api/organizers/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Organisateur non trouvé');
    });
  });
});