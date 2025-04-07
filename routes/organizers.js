import express from 'express';
import validate from '../middleware/validate.js';
import { createOrganizerSchema, updateOrganizerSchema } from '../validators/organizer.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  getAllOrganizers,
  getOrganizerById,
  getOrganizerEvents,
  createOrganizer,
  updateOrganizer,
  deleteOrganizer
} from '../controllers/organizerController.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllOrganizers);
router.get('/:id', getOrganizerById);
router.get('/:id/events', getOrganizerEvents);

// Routes protégées (nécessitent une authentification)
router.post('/', authMiddleware, validate(createOrganizerSchema), createOrganizer);
router.put('/:id', authMiddleware, validate(updateOrganizerSchema), updateOrganizer);
router.delete('/:id', authMiddleware, deleteOrganizer);

export default router;