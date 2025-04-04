import request from 'supertest';
import express from 'express';
import { Event } from '../models/index.js';
import eventsRoutes from '../routes/events.js';
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
  const mockEvent = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
  
  return {
    Event: mockEvent
  };
});

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/events', eventsRoutes);

describe('Events Routes', () => {
  // Nettoyage des mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/events', () => {
    it('should return a list of events', async () => {
      // Mock de findAll pour retourner un tableau d'événements
      const mockEvents = [
        {
          id: 1,
          title: 'Test Event 1',
          description: 'Test Description 1',
          date: new Date().toISOString(),
          venue: 'Test Venue 1',
          total_tickets: 100,
          available_tickets: 50,
          price: 20.00
        },
        {
          id: 2,
          title: 'Test Event 2',
          description: 'Test Description 2',
          date: new Date().toISOString(),
          venue: 'Test Venue 2',
          total_tickets: 200,
          available_tickets: 150,
          price: 30.00
        }
      ];
      
      Event.findAll.mockResolvedValue(mockEvents);
      
      const response = await request(app).get('/api/events');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(Event.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return a single event', async () => {
      // Mock de findByPk pour retourner un événement
      const mockEvent = {
        id: 1,
        title: 'Test Event',
        description: 'Test Description',
        date: new Date().toISOString(),
        venue: 'Test Venue',
        total_tickets: 100,
        available_tickets: 50,
        price: 20.00
      };
      
      Event.findByPk.mockResolvedValue(mockEvent);
      
      const response = await request(app).get('/api/events/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.title).toBe('Test Event');
      expect(Event.findByPk).toHaveBeenCalledWith('1');
    });

    it('should return 404 if event not found', async () => {
      // Mock de findByPk pour retourner null (événement non trouvé)
      Event.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/events/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Événement non trouvé');
    });
  });

  describe('POST /api/events', () => {
    it('should create a new event', async () => {
      // Mock de create pour retourner un événement créé
      const newEvent = {
        id: 3,
        title: 'New Event',
        description: 'New Event Description',
        date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        venue: 'New Venue',
        total_tickets: 100,
        available_tickets: 100,
        price: 25.00,
        status: 'upcoming'
      };
      
      Event.create.mockResolvedValue(newEvent);
      
      const response = await request(app)
        .post('/api/events')
        .send({
          title: 'New Event',
          description: 'New Event Description',
          date: new Date(Date.now() + 86400000).toISOString(),
          venue: 'New Venue',
          total_tickets: 100,
          price: 25.00
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body.event.id).toBe(3);
      expect(response.body.event.title).toBe('New Event');
      expect(Event.create).toHaveBeenCalled();
      expect(authMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update an existing event', async () => {
      // Mock de findByPk pour vérifier si l'événement existe
      Event.findByPk.mockResolvedValue({
        id: 1,
        title: 'Old Title',
        update: jest.fn()
      });
      
      // Mock pour la récupération après mise à jour
      const updatedEvent = {
        id: 1,
        title: 'Updated Title',
        description: 'Updated Description'
      };
      
      // Simuler la mise à jour et le retour de l'événement mis à jour
      Event.findByPk.mockImplementation(async (id, options) => {
        if (options && options.transaction) {
          return updatedEvent;
        } else {
          return {
            id: 1,
            title: 'Old Title',
            update: jest.fn().mockResolvedValue([1])
          };
        }
      });
      
      const response = await request(app)
        .put('/api/events/1')
        .send({
          title: 'Updated Title',
          description: 'Updated Description'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.event.title).toBe('Updated Title');
      expect(Event.findByPk).toHaveBeenCalled();
    });

    it('should return 404 if event to update not found', async () => {
      // Mock de findByPk pour retourner null (événement non trouvé)
      Event.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/events/999')
        .send({
          title: 'Updated Title'
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Événement non trouvé');
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete an event', async () => {
      // Mock de findByPk pour vérifier si l'événement existe
      Event.findByPk.mockResolvedValue({
        id: 1,
        title: 'Event to Delete',
        destroy: jest.fn().mockResolvedValue(true)
      });
      
      const response = await request(app).delete('/api/events/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Événement supprimé avec succès');
      expect(Event.findByPk).toHaveBeenCalledWith('1');
    });

    it('should return 404 if event to delete not found', async () => {
      // Mock de findByPk pour retourner null (événement non trouvé)
      Event.findByPk.mockResolvedValue(null);
      
      const response = await request(app).delete('/api/events/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Événement non trouvé');
    });
  });
});
