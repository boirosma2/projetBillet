import request from 'supertest'
import express from 'express'
import eventsRoutes from '../routes/events.js'

const app = express()
app.use(express.json())
app.use('/api/events', eventsRoutes)

describe('Events Routes', () => {
  it('should list events', async () => {
    const response = await request(app).get('/api/events')
    
    expect(response.statusCode).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })

  it('should create a new event', async () => {
    const response = await request(app)
      .post('/api/events')
      .send({
        title: 'Test Event',
        description: 'A test event description',
        date: '2024-10-15 18:00:00',
        venue: 'Test Venue',
        total_tickets: 500,
        price: 45.00
      })
    
    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body.message).toBe('Event created successfully')
  })
})
