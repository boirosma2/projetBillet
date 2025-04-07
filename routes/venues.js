import express from 'express';
import validate from '../middleware/validate.js';
import { createVenueSchema, updateVenueSchema } from '../validators/venue.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  getAllVenues,
  getVenueById,
  getVenueEvents,
  createVenue,
  updateVenue,
  deleteVenue
} from '../controllers/venueController.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllVenues);
router.get('/:id', getVenueById);
router.get('/:id/events', getVenueEvents);

// Routes protégées (nécessitent une authentification)
router.post('/', authMiddleware, validate(createVenueSchema), createVenue);
router.put('/:id', authMiddleware, validate(updateVenueSchema), updateVenue);
router.delete('/:id', authMiddleware, deleteVenue);

export default router;