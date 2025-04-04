import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import { User } from '../models/index.js';
import authRoutes from '../routes/auth.js';

// Mock des modèles Sequelize
jest.mock('../models/index.js', () => {
  const mockUser = {
    findOne: jest.fn(),
    create: jest.fn(),
    comparePassword: jest.fn()
  };
  
  return {
    User: mockUser,
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
app.use('/api/auth', authRoutes);

describe('Authentication Routes', () => {
  // Nettoyage des mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
    // Configuration de l'environnement
    process.env.JWT_SECRET = 'test_secret';
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Mock des retours de findOne et create
      User.findOne.mockResolvedValue(null); // L'utilisateur n'existe pas
      User.create.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'testuser@example.com',
        role: 'regular'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'Password123!'
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe('testuser');
      expect(response.body.email).toBe('testuser@example.com');
      expect(User.findOne).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalled();
    });

    it('should return 400 if the user already exists', async () => {
      // Mock du retour de findOne - simule un utilisateur existant
      User.findOne.mockResolvedValue({
        id: 1,
        email: 'testuser@example.com'
      });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'Password123!'
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Utilisateur déjà existant');
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should validate password requirements', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'weak'  // Mot de passe trop simple
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      // Mock du retour de findOne et comparePassword
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'testuser@example.com',
        role: 'regular',
        is_active: true,
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'Password123!'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('testuser@example.com');
      expect(mockUser.comparePassword).toHaveBeenCalled();
    });

    it('should return 400 if the user does not exist', async () => {
      // Mock du retour de findOne - simule qu'aucun utilisateur n'est trouvé
      User.findOne.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Identifiants invalides');
    });

    it('should return 400 if the password is incorrect', async () => {
      // Mock du retour de findOne et comparePassword
      const mockUser = {
        id: 1,
        email: 'testuser@example.com',
        is_active: true,
        comparePassword: jest.fn().mockResolvedValue(false) // Mot de passe incorrect
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'WrongPassword123!'
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Identifiants invalides');
      expect(mockUser.comparePassword).toHaveBeenCalled();
    });

    it('should return 403 if the account is inactive', async () => {
      // Mock du retour de findOne avec un compte inactif
      User.findOne.mockResolvedValue({
        id: 1,
        email: 'testuser@example.com',
        is_active: false
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'Password123!'
        });
      
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe('Ce compte a été désactivé');
    });
  });
});
