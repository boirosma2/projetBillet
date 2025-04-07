import request from 'supertest';
import express from 'express';
import { Ticket, sequelize } from '../models/index.js';
import ordersRoutes from '../routes/orders.js';
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
  const mockTicket = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  };
  
  return {
    Ticket: mockTicket,
    sequelize: {
      transaction: jest.fn(() => ({
        commit: jest.fn(),
        rollback: jest.fn()
      }))
    }
  };
});

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/orders', ordersRoutes);

describe('Orders Routes', () => {
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

  describe('GET /api/orders', () => {
    it('should return all orders for admin user', async () => {
      // Mock des commandes sous forme de tickets
      const mockOrders = [
        {
          id: 1,
          user_id: 2,
          event_id: 1,
          purchase_date: new Date().toISOString(),
          status: 'confirmed',
          price: 20.00,
          User: {
            username: 'user1',
            email: 'user1@example.com'
          },
          Event: {
            title: 'Concert 1',
            date: new Date().toISOString()
          }
        },
        {
          id: 2,
          user_id: 3,
          event_id: 2,
          purchase_date: new Date().toISOString(),
          status: 'pending',
          price: 30.00,
          User: {
            username: 'user2',
            email: 'user2@example.com'
          },
          Event: {
            title: 'Concert 2',
            date: new Date().toISOString()
          }
        }
      ];
      
      Ticket.findAll.mockResolvedValue(mockOrders);
      
      const response = await request(app).get('/api/orders');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(Ticket.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return a specific order', async () => {
      // Mock d'une commande spécifique
      const mockOrder = {
        id: 1,
        user_id: 2,
        event_id: 1,
        purchase_date: new Date().toISOString(),
        status: 'confirmed',
        price: 20.00,
        User: {
          username: 'user1',
          email: 'user1@example.com'
        },
        Event: {
          title: 'Concert 1',
          date: new Date().toISOString(),
          venue: 'Venue 1'
        }
      };
      
      Ticket.findByPk.mockResolvedValue(mockOrder);
      
      const response = await request(app).get('/api/orders/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body).toHaveProperty('User');
      expect(response.body).toHaveProperty('Event');
      expect(Ticket.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
    });

    it('should return 404 if order not found', async () => {
      // Mock d'une commande non trouvée
      Ticket.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/orders/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toContain('Commande non trouvée');
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    it('should update order status', async () => {
      // Mock d'une commande existante avec méthode de mise à jour
      const mockOrder = {
        id: 1,
        status: 'pending',
        update: jest.fn().mockResolvedValue([1])
      };
      
      Ticket.findByPk.mockResolvedValue(mockOrder);
      
      const response = await request(app)
        .put('/api/orders/1/status')
        .send({
          status: 'confirmed'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toContain('Statut de la commande mis à jour');
      expect(mockOrder.update).toHaveBeenCalledWith({ status: 'confirmed' });
    });

    it('should return 404 if order to update not found', async () => {
      // Mock d'une commande non trouvée
      Ticket.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/orders/999/status')
        .send({
          status: 'confirmed'
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toContain('Commande non trouvée');
    });

    it('should validate status value', async () => {
      const response = await request(app)
        .put('/api/orders/1/status')
        .send({
          status: 'invalid_status'
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });
});