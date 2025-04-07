import request from 'supertest';
import express from 'express';
import { EventType } from '../models/index.js';
import eventTypesRoutes from '../routes/eventTypes.js';
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
  const mockEventType = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
  
  return {
    EventType: mockEventType
  };
});

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/event-types', eventTypesRoutes);

describe('Event Types Routes', () => {
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

  describe('GET /api/event-types', () => {
    it('should return a list of event types', async () => {
      // Mock de findAll pour retourner un tableau de types d'événements
      const mockEventTypes = [
        {
          id: 1,
          name: 'Concert',
          description: 'Événement musical en direct'
        },
        {
          id: 2,
          name: 'Festival',
          description: 'Événement culturel sur plusieurs jours'
        },
        {
          id: 3,
          name: 'Théâtre',
          description: 'Représentation théâtrale'
        }
      ];
      
      EventType.findAll.mockResolvedValue(mockEventTypes);
      
      const response = await request(app).get('/api/event-types');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
      expect(EventType.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/event-types/:id', () => {
    it('should return a single event type', async () => {
      // Mock de findByPk pour retourner un type d'événement
      const mockEventType = {
        id: 1,
        name: 'Concert',
        description: 'Événement musical en direct'
      };
      
      EventType.findByPk.mockResolvedValue(mockEventType);
      
      const response = await request(app).get('/api/event-types/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Concert');
      expect(EventType.findByPk).toHaveBeenCalled();
      expect(EventType.findByPk.mock.calls[0][0]).toBe('1');
    });

    it('should return 404 if event type not found', async () => {
      EventType.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/event-types/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Type d\'événement non trouvé');
    });
  });

  describe('GET /api/event-types/:id/events', () => {
    it('should return all events of a specific type', async () => {
      // Mock de findByPk pour retourner un type d'événement avec ses événements
      const mockEventType = {
        id: 1,
        name: 'Concert',
        description: 'Événement musical en direct',
        events: [
          {
            id: 1,
            title: 'Concert Rock',
            venue: { id: 1, name: 'Stade de France' },
            organizer: { id: 1, name: 'Live Nation' },
            artists: [{ id: 1, name: 'Rock Band' }]
          },
          {
            id: 2,
            title: 'Concert Pop',
            venue: { id: 2, name: 'Zénith' },
            organizer: { id: 2, name: 'AEG Presents' },
            artists: [{ id: 2, name: 'Pop Star' }]
          }
        ]
      };
      
      EventType.findByPk.mockResolvedValue(mockEventType);
      
      const response = await request(app).get('/api/event-types/1/events');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].title).toBe('Concert Rock');
      expect(EventType.findByPk).toHaveBeenCalled();
    });

    it('should return 404 if event type not found for events', async () => {
      EventType.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/event-types/999/events');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Type d\'événement non trouvé');
    });
  });

  describe('POST /api/event-types', () => {
    it('should create a new event type', async () => {
      // Mock de create pour retourner un type d'événement créé
      const newEventType = {
        id: 4,
        name: 'Cinéma',
        description: 'Projection de films'
      };
      
      EventType.create.mockResolvedValue(newEventType);
      
      const response = await request(app)
        .post('/api/event-types')
        .send({
          name: 'Cinéma',
          description: 'Projection de films'
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body.eventType.id).toBe(4);
      expect(response.body.eventType.name).toBe('Cinéma');
      expect(EventType.create).toHaveBeenCalled();
      expect(authMiddleware).toHaveBeenCalled();
    });

    it('should handle unique constraint errors', async () => {
      // Mock de create pour simuler une erreur de contrainte unique
      EventType.create.mockRejectedValue({
        name: 'SequelizeUniqueConstraintError',
        errors: [{ path: 'name', message: 'name must be unique' }]
      });
      
      const response = await request(app)
        .post('/api/event-types')
        .send({
          name: 'Concert', // Nom qui existe déjà
          description: 'Événement musical'
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Un type d\'événement avec ce nom existe déjà');
    });
  });

  describe('PUT /api/event-types/:id', () => {
    it('should update an existing event type', async () => {
      // Créer un type d'événement original avec une méthode update
      const originalEventType = {
        id: 1,
        name: 'Old Name',
        description: 'Old Description',
        update: jest.fn().mockResolvedValue([1])
      };
      
      // Type d'événement mis à jour à retourner après l'update
      const updatedEventType = {
        id: 1,
        name: 'Updated Name',
        description: 'Updated Description'
      };
      
      // Configurer le mock pour retourner d'abord l'original puis le type mis à jour
      EventType.findByPk
        .mockResolvedValueOnce(originalEventType)  // Premier appel - vérification
        .mockResolvedValueOnce(updatedEventType);  // Deuxième appel - après mise à jour
      
      const response = await request(app)
        .put('/api/event-types/1')
        .send({
          name: 'Updated Name',
          description: 'Updated Description'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.eventType.name).toBe('Updated Name');
      expect(response.body.eventType.description).toBe('Updated Description');
      expect(EventType.findByPk).toHaveBeenCalled();
    });

    it('should return 404 if event type to update not found', async () => {
      EventType.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/event-types/999')
        .send({
          name: 'Unknown Type'
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Type d\'événement non trouvé');
    });
  });

  describe('DELETE /api/event-types/:id', () => {
    it('should delete an event type', async () => {
      // Mock de findByPk pour vérifier si le type d'événement existe
      EventType.findByPk.mockResolvedValue({
        id: 1,
        name: 'Type to Delete',
        destroy: jest.fn().mockResolvedValue(true)
      });
      
      const response = await request(app).delete('/api/event-types/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Type d\'événement supprimé avec succès');
      expect(EventType.findByPk).toHaveBeenCalledWith('1');
    });

    it('should return 404 if event type to delete not found', async () => {
      EventType.findByPk.mockResolvedValue(null);
      
      const response = await request(app).delete('/api/event-types/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Type d\'événement non trouvé');
    });
  });
});