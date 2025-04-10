import request from 'supertest';
import express from 'express';
import { User, Ticket, Event } from '../models/index.js';
import { sequelize } from '../config/database.js';
import usersRoutes from '../routes/users.js';
import { authMiddleware } from '../middleware/auth.js';

// Mock des middleware et modèles
jest.mock('../middleware/auth.js', () => ({
  authMiddleware: jest.fn((req, res, next) => {
    // Simuler un utilisateur authentifié
    req.user = { 
      id: 1, 
      email: 'test@example.com', 
      role: 'admin' 
    };
    next();
  })
}));

jest.mock('../config/database.js', () => {
  const mockTransaction = {
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue()
  };
  
  return {
    sequelize: {
      transaction: jest.fn().mockResolvedValue(mockTransaction)
    }
  };
});

jest.mock('../models/index.js', () => {
  const mockUser = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
  
  const mockTicket = {
    findAll: jest.fn().mockResolvedValue([
      {
        id: 1,
        user_id: 1,
        event_id: 101,
        price_paid: 50.00,
        created_at: new Date(),
        ticket_code: 'TICKET123',
        event: {
          id: 101,
          title: 'Concert Test'
        }
      }
    ])
  };
  
  return {
    User: mockUser,
    Ticket: mockTicket,
    Event: {}
  };
});

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/users', usersRoutes);

describe('Users Routes', () => {
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

  describe('GET /api/users', () => {
    it('should return a list of users for admin', async () => {
      // Mock des utilisateurs
      const mockUsers = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          role: 'admin',
          is_active: true
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@example.com',
          role: 'regular',
          is_active: true
        }
      ];
      
      User.findAll.mockResolvedValue(mockUsers);
      
      const response = await request(app).get('/api/users');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(authMiddleware).toHaveBeenCalled();
      expect(User.findAll).toHaveBeenCalledWith({
        attributes: { exclude: ['password'] },
        order: [['username', 'ASC']]
      });
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a specific user', async () => {
      // Mock d'un utilisateur spécifique
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'testuser@example.com',
        role: 'regular',
        is_active: true
      };
      
      User.findByPk.mockResolvedValue(mockUser);
      
      const response = await request(app).get('/api/users/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.username).toBe('testuser');
      expect(response.body).not.toHaveProperty('password');
      expect(User.findByPk).toHaveBeenCalledWith('1', {
        attributes: { exclude: ['password'] }
      });
    });

    it('should return 404 if user not found', async () => {
      // Mock d'utilisateur non trouvé
      User.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/users/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toContain('Utilisateur non trouvé');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      // Mock d'utilisateur existant avec méthode de mise à jour
      const mockUser = {
        id: 1,
        username: 'oldname',
        email: 'old@example.com',
        update: jest.fn().mockResolvedValue([1])
      };
      
      // Mock de l'utilisateur mis à jour retourné par la seconde requête
      const updatedMockUser = {
        id: 1,
        username: 'newname',
        email: 'new@example.com',
        role: 'regular',
        is_active: true
      };
      
      // Configuration des mocks pour simuler le bon flux
      User.findByPk.mockResolvedValueOnce(mockUser); // Première requête - trouver l'utilisateur
      User.findByPk.mockResolvedValueOnce(updatedMockUser); // Seconde requête - retourner mis à jour
      
      const response = await request(app)
        .put('/api/users/1')
        .send({
          username: 'newname',
          email: 'new@example.com'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toContain('Utilisateur mis à jour');
      expect(mockUser.update).toHaveBeenCalledWith({
        username: 'newname',
        email: 'new@example.com'
      }, { transaction: expect.anything() });
      expect(sequelize.transaction).toHaveBeenCalled();
    });

    it('should return 404 if user to update not found', async () => {
      // Mock d'utilisateur non trouvé
      User.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/users/999')
        .send({
          username: 'newname'
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toContain('Utilisateur non trouvé');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      // Mock d'utilisateur existant avec méthode destroy
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      User.findByPk.mockResolvedValue(mockUser);
      
      const response = await request(app).delete('/api/users/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toContain('Utilisateur supprimé');
      expect(mockUser.destroy).toHaveBeenCalledWith({ transaction: expect.anything() });
    });

    it('should return 404 if user to delete not found', async () => {
      // Mock d'utilisateur non trouvé
      User.findByPk.mockResolvedValue(null);
      
      const response = await request(app).delete('/api/users/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toContain('Utilisateur non trouvé');
    });
  });

  describe('PATCH /api/users/:id/status', () => {
    it('should change user status', async () => {
      // Mock d'utilisateur existant avec méthode update
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_active: true,
        update: jest.fn().mockResolvedValue([1])
      };
      
      User.findByPk.mockResolvedValue(mockUser);
      
      const response = await request(app)
        .patch('/api/users/1/status')
        .send({ is_active: false });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toContain('désactivé');
      expect(mockUser.update).toHaveBeenCalledWith(
        { is_active: false },
        { transaction: expect.anything() }
      );
    });

    it('should return 404 if user not found', async () => {
      User.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .patch('/api/users/999/status')
        .send({ is_active: false });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toContain('Utilisateur non trouvé');
    });

    it('should return 400 if status is not provided', async () => {
      const response = await request(app)
        .patch('/api/users/1/status')
        .send({});
      
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('statut');
    });
  });

  describe('GET /api/users/my/tickets', () => {
    it('should return tickets for the current user', async () => {
      // Mock des tickets de l'utilisateur actuel
      const mockTickets = [
        {
          id: 1,
          user_id: 1, // L'ID correspond à l'utilisateur authentifié
          event_id: 101,
          price_paid: 50.00,
          created_at: new Date(),
          ticket_code: 'TICKET123',
          event: {
            id: 101,
            title: 'Concert Test'
          }
        }
      ];
      
      // Pas besoin de trouver l'utilisateur, car on utilise l'ID de req.user
      Ticket.findAll.mockResolvedValue(mockTickets);
      
      const response = await request(app).get('/api/users/my/tickets');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].ticket_code).toBe('TICKET123');
      expect(Ticket.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id: 1 } // L'ID de l'utilisateur authentifié
      }));
    });
  });
  
  describe('GET /api/users/:id/tickets', () => {
    it('should return tickets for a user', async () => {
      // Mock d'utilisateur existant
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_active: true
      };
      
      // Mock des tickets associés
      const mockTickets = [
        {
          id: 1,
          user_id: 1,
          event_id: 101,
          price: 50.00,
          purchase_date: new Date(),
          ticket_code: 'TICKET123',
          event: {
            id: 101,
            name: 'Concert Test',
            venue: { name: 'Venue Test' },
            eventType: { name: 'Concert' }
          }
        }
      ];
      
      User.findByPk.mockResolvedValue(mockUser);
      Ticket.findAll.mockResolvedValue(mockTickets);
      
      const response = await request(app).get('/api/users/1/tickets');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].ticket_code).toBe('TICKET123');
      // Utilisation de expect.objectContaining pour ne vérifier que certains paramètres
      expect(Ticket.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id: '1' }
      }));
    });

    it('should return 404 if user for tickets not found', async () => {
      User.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/users/999/tickets');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toContain('Utilisateur non trouvé');
    });
  });
});