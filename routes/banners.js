import express from 'express';
import { 
  getAllBanners, 
  getActiveBanner,
  getFeaturedBanners,
  getBannerById,
  createBanner, 
  updateBanner, 
  activateBanner,
  updateBannerOrder,
  deleteBanner,
  trackBannerClick,
  getBannerStats
} from '../controllers/bannerController.js';
import { authMiddleware } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createBannerSchema, updateBannerSchema, bannerOrderSchema } from '../validators/banners.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Routes publiques
router.get('/active', getActiveBanner);
router.get('/featured', getFeaturedBanners);
router.post('/:id/click', trackBannerClick);

// Toutes les autres routes nécessitent une authentification
router.use(authMiddleware);

// Routes admin uniquement
router.get('/', getAllBanners);
router.get('/:id', getBannerById);
router.get('/:id/stats', getBannerStats);
router.post('/', upload.single('image'), validate(createBannerSchema), createBanner);
router.put('/:id', upload.single('image'), validate(updateBannerSchema), updateBanner);
router.patch('/:id/activate', activateBanner);
router.patch('/order', validate(bannerOrderSchema), updateBannerOrder);
router.delete('/:id', deleteBanner);

export default router;