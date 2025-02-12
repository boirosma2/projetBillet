import express from 'express'
import db from '../config/db.js'

const router = express.Router()

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await db.query('SELECT * FROM events')
    res.json(events)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message })
  }
})

// Create a new event
router.post('/', async (req, res) => {
  try {
    const { title, description, date, venue, total_tickets, price } = req.body
    const result = await db.run(
      'INSERT INTO events (title, description, date, venue, total_tickets, available_tickets, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, date, venue, total_tickets, total_tickets, price]
    )
    res.status(201).json({ id: result.lastID, message: 'Event created successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message })
  }
})

export default router
