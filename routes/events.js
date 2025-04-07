import express from 'express';
import validate from '../middleware/validate.js';
import { 
  createEventSchema, 
  updateEventSchema,
  addArtistToEventSchema,
  updateEventArtistSchema
} from '../validators/events.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  addArtistToEvent,
  updateEventArtist,
  removeArtistFromEvent
} from '../controllers/eventController.js';

const router = express.Router();

/**
 * @desc    Get all events
 * @route   GET /api/events
 * @access  Public
 */
router.get('/', getAllEvents);

/**
 * @desc    Get event by ID
 * @route   GET /api/events/:id
 * @access  Public
 */
router.get('/:id', getEventById);

/**
 * @desc    Create new event
 * @route   POST /api/events
 * @access  Private
 */
router.post('/', authMiddleware, validate(createEventSchema), createEvent);

/**
 * @desc    Update event
 * @route   PUT /api/events/:id
 * @access  Private
 */
router.put('/:id', authMiddleware, validate(updateEventSchema), updateEvent);

/**
 * @desc    Delete event
 * @route   DELETE /api/events/:id
 * @access  Private
 */
router.delete('/:id', authMiddleware, deleteEvent);

/**
 * @desc    Add artist to event
 * @route   POST /api/events/:id/artists
 * @access  Private
 */
router.post('/:id/artists', authMiddleware, validate(addArtistToEventSchema), addArtistToEvent);

/**
 * @desc    Update artist in event
 * @route   PUT /api/events/:id/artists/:artist_id
 * @access  Private
 */
router.put('/:id/artists/:artist_id', authMiddleware, validate(updateEventArtistSchema), updateEventArtist);

/**
 * @desc    Remove artist from event
 * @route   DELETE /api/events/:id/artists/:artist_id
 * @access  Private
 */
router.delete('/:id/artists/:artist_id', authMiddleware, removeArtistFromEvent);

export default router;