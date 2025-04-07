import request from 'supertest';
import express from 'express';
import { User } from '../models/index.js';
import usersRoutes from '../routes/users.js';
import { authMiddleware } from '../middleware/auth.js';

// Mock des middleware et modèles
jest.mock('../middleware/auth.js', () => ({
  authMiddleware: jest.fn((req, res, next) => {
    // Simuler un utilisateur authentifié avec rôle admin
    req.user = { id: 1, email: 'admin@example.com', role: 'admin' };
    next();
  })
}));

jest.mock('../models/index.js', () => {
  const mockUser = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
  
  return {
    User: mockUser
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
      expect(User.findAll).toHaveBeenCalled();
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
      expect(User.findByPk).toHaveBeenCalledWith('1');
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
      
      User.findByPk.mockResolvedValue(mockUser);
      User.update.mockResolvedValue([1]);
      
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
      });
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
    it('should delete a user (soft delete)', async () => {
      // Mock d'utilisateur existant avec méthode de mise à jour
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_active: true,
        update: jest.fn().mockResolvedValue([1])
      };
      
      User.findByPk.mockResolvedValue(mockUser);
      
      const response = await request(app).delete('/api/users/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toContain('Utilisateur désactivé');
      expect(mockUser.update).toHaveBeenCalledWith({ is_active: false });
    });

    it('should return 404 if user to delete not found', async () => {
      // Mock d'utilisateur non trouvé
      User.findByPk.mockResolvedValue(null);
      
      const response = await request(app).delete('/api/users/999');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toContain('Utilisateur non trouvé');
    });
  });
});