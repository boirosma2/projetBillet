import express from 'express';
import validate from '../middleware/validate.js';
import { createEventTypeSchema, updateEventTypeSchema } from '../validators/eventType.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  getAllEventTypes,
  getEventTypeById,
  getEventTypeEvents,
  createEventType,
  updateEventType,
  deleteEventType
} from '../controllers/eventTypeController.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllEventTypes);
router.get('/:id', getEventTypeById);
router.get('/:id/events', getEventTypeEvents);

// Routes protégées (nécessitent une authentification)
router.post('/', authMiddleware, validate(createEventTypeSchema), createEventType);
router.put('/:id', authMiddleware, validate(updateEventTypeSchema), updateEventType);
router.delete('/:id', authMiddleware, deleteEventType);

export default router;