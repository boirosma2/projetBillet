import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../config/db.js'

const router = express.Router()

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email])
    if (existingUser) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' })
    }

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Enregistrer l'utilisateur
    const result = await db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    )

    res.status(201).json({ 
      id: result.lastID, 
      username, 
      email 
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message })
  }
})

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Trouver l'utilisateur
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email])
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' })
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides' })
    }

    // Générer un token
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    )

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      } 
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur de connexion', error: error.message })
  }
})

export default router
