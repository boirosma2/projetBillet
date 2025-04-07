import express from 'express';
import validate from '../middleware/validate.js';
import { createCitySchema, updateCitySchema } from '../validators/city.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  getAllCities,
  getCityById,
  getCityEvents,
  createCity,
  updateCity,
  deleteCity
} from '../controllers/cityController.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllCities);
router.get('/:id', getCityById);
router.get('/:id/events', getCityEvents);

// Routes protégées (nécessitent une authentification)
router.post('/', authMiddleware, validate(createCitySchema), createCity);
router.put('/:id', authMiddleware, validate(updateCitySchema), updateCity);
router.delete('/:id', authMiddleware, deleteCity);

export default router;