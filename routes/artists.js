import express from 'express';
import validate from '../middleware/validate.js';
import { 
  createArtistSchema, 
  updateArtistSchema, 
  addArtistToEventSchema 
} from '../validators/artist.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  getAllArtists,
  getArtistById,
  getArtistEvents,
  createArtist,
  updateArtist,
  deleteArtist,
  addArtistToEvent,
  removeArtistFromEvent,
  updateArtistInEvent
} from '../controllers/artistController.js';

const router = express.Router();

// Routes pour les artistes
router.get('/', getAllArtists);
router.get('/:id', getArtistById);
router.get('/:id/events', getArtistEvents);
router.post('/', authMiddleware, validate(createArtistSchema), createArtist);
router.put('/:id', authMiddleware, validate(updateArtistSchema), updateArtist);
router.delete('/:id', authMiddleware, deleteArtist);

// Routes pour les relations artiste-événement
router.post('/events/:event_id', authMiddleware, validate(addArtistToEventSchema), addArtistToEvent);
router.delete('/events/:event_id/:artist_id', authMiddleware, removeArtistFromEvent);
router.put('/events/:event_id/:artist_id', authMiddleware, updateArtistInEvent);

export default router;