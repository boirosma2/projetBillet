import express from 'express';
import jwt from 'jsonwebtoken';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.js';
import { User } from '../models/index.js';
import { sequelize } from '../config/database.js';

const router = express.Router();

// Inscription avec validation
router.post('/register', validate(registerSchema), async (req, res) => {
  // Utiliser une transaction pour garantir l'intégrité des données
  const transaction = await sequelize.transaction();
  
  try {
    const { username, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ 
      where: { email },
      transaction
    });
    
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    // Créer l'utilisateur - le hook beforeCreate se chargera de hacher le mot de passe
    const user = await User.create({
      username,
      email,
      password, // Le mot de passe sera haché automatiquement par le hook du modèle
      role: 'regular',
      is_active: true
    }, { transaction });

    // Valider la transaction
    await transaction.commit();

    // Retourner l'utilisateur sans le mot de passe
    res.status(201).json({ 
      id: user.id, 
      username: user.username, 
      email: user.email 
    });
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await transaction.rollback();
    
    // Gérer les erreurs spécifiques
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'Cet utilisateur existe déjà', 
        error: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Erreur de validation', 
        error: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message });
  }
});

// Connexion avec validation
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Vérifier si le compte est actif
    if (!user.is_active) {
      return res.status(403).json({ message: 'Ce compte a été désactivé' });
    }

    // Vérifier le mot de passe avec la méthode du modèle
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Générer un token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Retourner le token et les informations utilisateur
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur de connexion', error: error.message });
  }
});

export default router;