import request from 'supertest';
import express from 'express';
import { Banner } from '../models/index.js';
import bannersRoutes from '../routes/banners.js';
import { authMiddleware } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

/**
 * Tests des routes pour les bannières promotionnelles
 * Ces tests vérifient le fonctionnement des endpoints CRUD pour les bannières
 */
describe('Banners Routes', () => {
  // Mock des middleware et modèles pour isoler les tests
  jest.mock('../middleware/auth.js', () => ({
    authMiddleware: jest.fn((req, res, next) => {
      // Simuler un utilisateur authentifié avec rôle admin
      req.user = { id: 1, email: 'admin@example.com', role: 'admin' };
      next();
    })
  }));

  jest.mock('../middleware/upload.js', () => ({
    single: jest.fn(() => (req, res, next) => {
      // Simuler un fichier uploadé
      req.file = {
        filename: 'test-banner.jpg',
        path: '/uploads/test-banner.jpg'
      };
      next();
    })
  }));

  // Mock du modèle Banner avec des méthodes simulées pour les tests
  jest.mock('../models/index.js', () => {
    const Banner = {
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      findByPk: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue([1]),
      destroy: jest.fn().mockResolvedValue(1)
    };
    
    return {
      Banner,
      // Simuler la structure des séquences Sequelize
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
  app.use('/api/banners', bannersRoutes);

  // Nettoyage des mocks avant chaque test pour éviter les interférences
  beforeEach(() => {
    jest.clearAllMocks();
    // Préparer des mocks pour les méthodes de models
    const mockBannerWithMethods = {
      id: 1,
      title: 'Test Banner',
      image_path: 'test-banner.jpg',
      is_active: true,
      toJSON: jest.fn().mockReturnValue({
        id: 1,
        title: 'Test Banner',
        image_url: '/uploads/test-banner.jpg',
        is_active: true
      }),
      update: jest.fn().mockResolvedValue([1]),
      destroy: jest.fn().mockResolvedValue(true)
    };
    
    // Réinitialiser les mocks
    Banner.findOne = jest.fn().mockResolvedValue(mockBannerWithMethods);
    Banner.findAll = jest.fn().mockResolvedValue([mockBannerWithMethods, {...mockBannerWithMethods, id: 2}]);
    Banner.findByPk = jest.fn().mockResolvedValue(mockBannerWithMethods);
    Banner.create = jest.fn().mockResolvedValue(mockBannerWithMethods);
  });
  
  // Nettoyage global après tous les tests
  afterAll(done => {
    // Ferme tous les timers et connexions pendantes
    jest.useRealTimers();
    setTimeout(() => {
      done();
    }, 100);
  });

  /**
   * Test #1: GET /api/banners/active
   * Vérifie qu'on peut récupérer la bannière active
   */
  describe('GET /api/banners/active', () => {
    it('should return the active banner', async () => {
      // Configurer le mock pour ce test spécifique
      const mockBanner = {
        id: 1,
        title: 'Active Banner',
        image_url: '/uploads/banner.jpg',
        is_active: true,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          title: 'Active Banner',
          image_url: '/uploads/banner.jpg',
          is_active: true
        })
      };
      
      Banner.findOne.mockResolvedValue(mockBanner);
      
      // Exécution de la requête
      const response = await request(app).get('/api/banners/active');
      
      // Vérifications
      expect(response.statusCode).toBe(200);
      expect(response.body.title).toBe('Active Banner');
      expect(response.body.is_active).toBe(true);
      expect(Banner.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { is_active: true }
        })
      );
    });

    /**
     * Test #2: GET /api/banners/active (cas d'erreur)
     * Vérifie le comportement quand aucune bannière active n'est trouvée
     */
    it('should return 404 if no active banner found', async () => {
      // Mock absence de bannière active
      Banner.findOne.mockResolvedValue(null);
      
      // Exécution de la requête
      const response = await request(app).get('/api/banners/active');
      
      // Vérifications
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Aucune bannière active trouvée');
    });
  });

  /**
   * Test #3: GET /api/banners
   * Vérifie qu'un admin peut récupérer toutes les bannières
   */
  describe('GET /api/banners', () => {
    it('should return all banners for admin', async () => {
      // Mock de toutes les bannières
      const mockBanners = [
        {
          id: 1,
          title: 'Banner 1',
          image_url: '/uploads/banner1.jpg',
          is_active: true,
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            title: 'Banner 1',
            image_url: '/uploads/banner1.jpg',
            is_active: true
          })
        },
        {
          id: 2,
          title: 'Banner 2',
          image_url: '/uploads/banner2.jpg',
          is_active: false,
          toJSON: jest.fn().mockReturnValue({
            id: 2,
            title: 'Banner 2',
            image_url: '/uploads/banner2.jpg',
            is_active: false
          })
        }
      ];
      
      Banner.findAll.mockResolvedValue(mockBanners);
      
      // Exécution de la requête
      const response = await request(app).get('/api/banners');
      
      // Vérifications
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(Banner.findAll).toHaveBeenCalled();
      expect(authMiddleware).toHaveBeenCalled();
    });
  });

  /**
   * Test #4: POST /api/banners
   * Vérifie la création d'une nouvelle bannière
   */
  describe('POST /api/banners', () => {
    it('should create a new banner', async () => {
      // Mock de la création de bannière
      const newBanner = {
        id: 3,
        title: 'New Banner',
        image_path: 'test-banner.jpg',
        is_active: true,
        toJSON: jest.fn().mockReturnValue({
          id: 3,
          title: 'New Banner',
          image_url: '/uploads/test-banner.jpg',
          is_active: true
        })
      };
      
      Banner.create.mockResolvedValue(newBanner);
      
      // Exécution de la requête
      const response = await request(app)
        .post('/api/banners')
        .field('title', 'New Banner')
        .field('link_url', 'https://example.com/new-promo')
        .field('is_active', 'true');
      
      // Vérifications
      expect(upload.single).toHaveBeenCalled();
      expect(Banner.create).toHaveBeenCalled();
    });
    
    /**
     * Test #5: POST /api/banners avec désactivation des autres bannières
     * Vérifie que les bannières actives existantes sont désactivées quand on crée une nouvelle bannière active
     */
    it('should deactivate other banners if new one is active', async () => {
      // Mock de bannière active existante
      const existingActiveBanner = {
        id: 1,
        title: 'Old Banner',
        is_active: true,
        update: jest.fn().mockResolvedValue([1])
      };
      
      // Nouvelle bannière avec is_active = true
      const newBanner = {
        id: 3,
        title: 'New Banner',
        image_path: 'test-banner.jpg',
        is_active: true,
        toJSON: jest.fn().mockReturnValue({
          id: 3,
          title: 'New Banner',
          image_url: '/uploads/test-banner.jpg',
          is_active: true
        })
      };
      
      Banner.findOne.mockResolvedValue(existingActiveBanner);
      Banner.create.mockResolvedValue(newBanner);
      
      // Exécution de la requête
      const response = await request(app)
        .post('/api/banners')
        .field('title', 'New Banner')
        .field('link_url', 'https://example.com/new-promo')
        .field('is_active', 'true');
      
      // Vérifications
      expect(Banner.findOne).toHaveBeenCalledWith({ where: { is_active: true } });
      expect(existingActiveBanner.update).toHaveBeenCalledWith({ is_active: false });
    });
  });

  /**
   * Test #6: PUT /api/banners/:id
   * Vérifie la mise à jour d'une bannière existante
   */
  describe('PUT /api/banners/:id', () => {
    it('should update a banner', async () => {
      // Simuler une bannière existante avec une méthode update
      const mockBanner = {
        id: 1,
        title: 'Old Title',
        image_path: 'old-image.jpg',
        link_url: 'https://example.com/old',
        is_active: false,
        update: jest.fn().mockResolvedValue([1]),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          title: 'Updated Title',
          image_url: '/uploads/test-banner.jpg',
          link_url: 'https://example.com/updated',
          is_active: true
        })
      };
      
      Banner.findByPk.mockResolvedValue(mockBanner);
      Banner.findOne.mockResolvedValue(null); // Pas d'autre bannière active
      
      // Exécution de la requête
      const response = await request(app)
        .put('/api/banners/1')
        .send({
          title: 'Updated Title',
          link_url: 'https://example.com/updated',
          is_active: true
        });
      
      // Vérifications
      expect(mockBanner.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Title',
          link_url: 'https://example.com/updated',
          is_active: true
        })
      );
    });

    /**
     * Test #7: PUT /api/banners/:id (cas d'erreur)
     * Vérifie le comportement quand la bannière à mettre à jour n'existe pas
     */
    it('should return 404 if banner not found', async () => {
      // Mock bannière non trouvée
      Banner.findByPk.mockResolvedValue(null);
      
      // Exécution de la requête
      const response = await request(app)
        .put('/api/banners/999')
        .send({
          title: 'Updated Title'
        });
      
      // Vérifications
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Bannière non trouvée');
    });

    /**
     * Test #8: PUT /api/banners/:id avec désactivation des autres bannières
     * Vérifie que les bannières actives existantes sont désactivées quand on active une bannière
     */
    it('should deactivate other banners if updated one is active', async () => {
      // Bannière à mettre à jour
      const bannerToUpdate = {
        id: 1,
        title: 'Banner to Update',
        is_active: false,
        update: jest.fn().mockResolvedValue([1]),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          title: 'Updated Banner',
          is_active: true
        })
      };
      
      // Autre bannière active existante
      const otherActiveBanner = {
        id: 2,
        title: 'Other Banner',
        is_active: true,
        update: jest.fn().mockResolvedValue([1])
      };
      
      Banner.findByPk.mockResolvedValue(bannerToUpdate);
      // Trouver une autre bannière active
      Banner.findOne.mockResolvedValue(otherActiveBanner);
      
      // Exécution de la requête
      const response = await request(app)
        .put('/api/banners/1')
        .send({
          title: 'Updated Banner',
          is_active: true // Mettre active à true
        });
      
      // Vérifications
      expect(otherActiveBanner.update).toHaveBeenCalledWith({ is_active: false });
      expect(bannerToUpdate.update).toHaveBeenCalled();
    });
  });

  /**
   * Test #9: DELETE /api/banners/:id
   * Vérifie la suppression d'une bannière
   */
  describe('DELETE /api/banners/:id', () => {
    it('should delete a banner', async () => {
      // Mock de bannière existante avec méthode destroy
      const existingBanner = {
        id: 1,
        title: 'Banner to Delete',
        image_path: 'image-to-delete.jpg',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Banner.findByPk.mockResolvedValue(existingBanner);
      
      // Exécution de la requête
      const response = await request(app).delete('/api/banners/1');
      
      // Vérifications
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Bannière supprimée avec succès');
      expect(existingBanner.destroy).toHaveBeenCalled();
    });

    /**
     * Test #10: DELETE /api/banners/:id (cas d'erreur)
     * Vérifie le comportement quand la bannière à supprimer n'existe pas
     */
    it('should return 404 if banner to delete not found', async () => {
      // Mock bannière non trouvée
      Banner.findByPk.mockResolvedValue(null);
      
      // Exécution de la requête
      const response = await request(app).delete('/api/banners/999');
      
      // Vérifications
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Bannière non trouvée');
    });
  });
});