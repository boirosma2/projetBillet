import db from './config/db.js'
import bcrypt from 'bcryptjs'

async function seedDatabase() {
  try {
    // Seed users
    const hashedPassword = await bcrypt.hash('password123', 10)
    await db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
      ['johndoe', 'john@example.com', hashedPassword]
    )
    await db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
      ['janedoe', 'jane@example.com', hashedPassword]
    )

    // Seed events
    await db.run(`
      INSERT INTO events 
      (title, description, date, venue, total_tickets, available_tickets, price) 
      VALUES 
      (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Summer Music Festival', 
      'Annual summer music festival with top artists', 
      '2024-07-15 18:00:00', 
      'Central Park', 
      1000, 
      1000, 
      50.00
    ])

    await db.run(`
      INSERT INTO events 
      (title, description, date, venue, total_tickets, available_tickets, price) 
      VALUES 
      (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Tech Conference 2024', 
      'Leading technology conference with global speakers', 
      '2024-09-20 09:00:00', 
      'Convention Center', 
      500, 
      500, 
      150.00
    ])

    console.log('Database seeded successfully')
  } catch (error) {
    console.error('Seeding error:', error)
  }
}

seedDatabase()
