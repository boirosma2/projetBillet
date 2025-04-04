import express from 'express';
import upload from '../middleware/upload.js';
import { 
  getActiveBanner, 
  getAllBanners, 
  createBanner, 
  updateBanner, 
  deleteBanner 
} from '../controllers/bannerController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Route pour obtenir la bannière active (publique)
router.get('/active', getActiveBanner);

// Route pour obtenir toutes les bannières
router.get('/', authMiddleware, getAllBanners);

// Route pour créer une nouvelle bannière
router.post('/', authMiddleware, upload.single('image'), createBanner);

// Route pour mettre à jour une bannière
router.put('/:id', authMiddleware, upload.single('image'), updateBanner);

// Route pour supprimer une bannière
router.delete('/:id', authMiddleware, deleteBanner);

export default router;