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
import validate from '../middleware/validate.js';
import { createBannerSchema, updateBannerSchema } from '../validators/banners.js';

// Middleware pour valider le corps de la requête après l'upload du fichier
const validateBannerData = (schema) => {
  return (req, res, next) => {
    // La validation de Joi ne peut pas gérer les fichiers, donc on exclut le fichier pour la validation
    const dataToValidate = { ...req.body };
    
    // Convertir les chaînes en types appropriés
    if (dataToValidate.event_id === '') {
      dataToValidate.event_id = null;
    } else if (dataToValidate.event_id) {
      dataToValidate.event_id = parseInt(dataToValidate.event_id, 10);
    }
    
    if (dataToValidate.is_active === 'true') {
      dataToValidate.is_active = true;
    } else if (dataToValidate.is_active === 'false') {
      dataToValidate.is_active = false;
    }
    
    // Valider avec le schéma
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      return res.status(400).json({ 
        message: 'Erreur de validation des données',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    // Mettre à jour req.body avec les valeurs validées et transformées
    req.body = { ...req.body, ...value };
    next();
  };
};

const router = express.Router();

// Route pour obtenir la bannière active (publique)
router.get('/active', getActiveBanner);

// Route pour obtenir toutes les bannières
router.get('/', authMiddleware, getAllBanners);

// Route pour créer une nouvelle bannière avec validation
router.post(
  '/', 
  authMiddleware, 
  upload.single('image'), 
  validateBannerData(createBannerSchema), 
  createBanner
);

// Route pour mettre à jour une bannière avec validation
router.put(
  '/:id', 
  authMiddleware, 
  upload.single('image'), 
  validateBannerData(updateBannerSchema), 
  updateBanner
);

// Route pour supprimer une bannière
router.delete('/:id', authMiddleware, deleteBanner);

export default router;