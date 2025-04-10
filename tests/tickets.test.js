import request from 'supertest';
import express from 'express';
import { Ticket, Event, User, sequelize } from '../models/index.js';
import ticketsRoutes from '../routes/tickets.js';
import { authMiddleware } from '../middleware/auth.js';

// Mock des middleware et modèles
jest.mock('../middleware/auth.js', () => ({
  authMiddleware: jest.fn((req, res, next) => {
    // Simuler un utilisateur authentifié
    req.user = { id: 1, email: 'test@example.com', role: 'regular' };
    next();
  })
}));

jest.mock('../models/index.js', () => {
  const mockTicket = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn()
  };
  
  const mockEvent = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    save: jest.fn()
  };
  
  const mockUser = {
    findByPk: jest.fn(),
    findOne: jest.fn()
  };
  
  return {
    Ticket: mockTicket,
    Event: mockEvent,
    User: mockUser,
    sequelize: {
      transaction: jest.fn(() => ({
        commit: jest.fn(),
        rollback: jest.fn()
      })),
      LOCK: {
        UPDATE: 'UPDATE'
      }
    }
  };
});

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/tickets', ticketsRoutes);

describe('Tickets Routes', () => {
  // Nettoyage des mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Nettoyage global après tous les tests
  afterAll(done => {
    // Ferme tous les timers et connexions pendantes
    jest.useRealTimers();
    setTimeout(() => {
      done();
    }, 100);
  });

  describe('POST /api/tickets/buy', () => {
    it('should purchase a ticket successfully', async () => {
      // Mock de l'événement avec des billets disponibles
      const mockEvent = {
        id: 1,
        title: 'Test Event',
        available_tickets: 10,
        price: 20.00,
        update: jest.fn().mockResolvedValue([1]),
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Mock utilisateur existant
      const mockUser = {
        id: 1,
        email: 'test@example.com'
      };
      
      // Mock de la création de ticket
      const mockTicket = {
        id: 1,
        event_id: 1,
        user_id: 1,
        purchase_date: new Date().toISOString(),
        price_paid: 20.00,
        status: 'paid',
        ticket_code: 'TIX-ABC123'
      };
      
      // Configuration des mocks
      Event.findByPk.mockResolvedValue(mockEvent);
      User.findByPk.mockResolvedValue(mockUser);
      Ticket.create.mockResolvedValue(mockTicket);
      
      const response = await request(app)
        .post('/api/tickets/buy')
        .send({
          event_id: 1
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('ticket');
      expect(response.body.ticket.event_id).toBe(1);
      expect(response.body.ticket.user_id).toBe(1);
      expect(response.body.ticket.status).toBe('paid');
      expect(Event.findByPk).toHaveBeenCalled();
      expect(Ticket.create).toHaveBeenCalled();
      expect(mockEvent.save).toHaveBeenCalled();
    });

    it('should return 404 if event not found', async () => {
      // Mock de l'événement non trouvé
      Event.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/tickets/buy')
        .send({
          event_id: 999
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toContain('Événement');
      expect(response.body.message).toContain('non trouvé');
    });

    it('should return 400 if not enough tickets available', async () => {
      // Mock de l'événement avec des billets insuffisants
      const mockEvent = {
        id: 1,
        title: 'Test Event',
        available_tickets: 0,
        price: 20.00
      };
      
      Event.findByPk.mockResolvedValue(mockEvent);
      
      const response = await request(app)
        .post('/api/tickets/buy')
        .send({
          event_id: 1
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('Aucun ticket disponible');
    });
  });

  describe('GET /api/tickets/user', () => {
    it('should return user tickets', async () => {
      // Mock des tickets utilisateur
      const mockTickets = [
        {
          id: 1,
          event_id: 1,
          user_id: 1,
          purchase_date: new Date().toISOString(),
          price: 20.00,
          status: 'confirmed',
          Event: { title: 'Test Event 1' }
        },
        {
          id: 2,
          event_id: 2,
          user_id: 1,
          purchase_date: new Date().toISOString(),
          price: 30.00,
          status: 'confirmed',
          Event: { title: 'Test Event 2' }
        }
      ];
      
      Ticket.findAll.mockResolvedValue(mockTickets);
      
      const response = await request(app).get('/api/tickets/user');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(Ticket.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 1 }
        })
      );
    });
  });

  describe('GET /api/tickets/:id', () => {
    it('should return a specific ticket', async () => {
      // Mock du ticket spécifique
      const mockTicket = {
        id: 1,
        event_id: 1,
        user_id: 1,
        purchase_date: new Date().toISOString(),
        price: 20.00,
        status: 'paid',
        Event: {
          title: 'Test Event',
          date: new Date().toISOString(),
          venue: 'Test Venue'
        }
      };
      
      Ticket.findOne.mockResolvedValue(mockTicket);
      
      const response = await request(app).get('/api/tickets/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body).toHaveProperty('Event');
      expect(response.body.Event.title).toBe('Test Event');
      expect(Ticket.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' }
        })
      );
    });

    it('should return 404 if ticket not found', async () => {
      // Mock de ticket non trouvé
      Ticket.findOne.mockResolvedValue(null);
      
      const response = await request(app).get('/api/tickets/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toContain('Ticket non trouvé');
    });
  });
});