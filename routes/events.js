import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await db.query('SELECT * FROM events');
    res.json(events.rows); // Accéder aux résultats via `rows`
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Create a new event
router.post('/', async (req, res) => {
  try {
    const { title, description, date, venue, total_tickets, available_tickets, price } = req.body;

    // Utiliser db.query pour insérer un nouvel événement
    const result = await db.query(
      'INSERT INTO events (title, description, date, venue, total_tickets, available_tickets, price) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, date, venue, total_tickets, available_tickets, price]
    );

    // Retourner l'événement créé
    res.status(201).json({ 
      id: result.rows[0].id, 
      message: 'Event created successfully', 
      event: result.rows[0] 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

export default router;