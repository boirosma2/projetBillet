import request from 'supertest'
import express from 'express'
import authRoutes from '../routes/auth.js'

const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)

describe('Authentication Routes', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123'
      })
    
    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body.username).toBe('testuser')
  })

  it('should login an existing user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      })
    
    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('token')
    expect(response.body).toHaveProperty('userId')
  })
})
