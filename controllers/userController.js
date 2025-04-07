import { User, Ticket, Event } from '../models/index.js';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

/**
 * Récupérer tous les utilisateurs
 * @route GET /api/users
 * @access Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    // Seuls les admins peuvent voir tous les utilisateurs
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['username', 'ASC']]
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: error.message });
  }
};

/**
 * Récupérer un utilisateur par son ID
 * @route GET /api/users/:id
 * @access Admin ou l'utilisateur lui-même
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'utilisateur demande ses propres informations ou est admin
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error: error.message });
  }
};

/**
 * Mettre à jour un utilisateur
 * @route PUT /api/users/:id
 * @access Admin ou l'utilisateur lui-même
 */
export const updateUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Vérifier si l'utilisateur modifie ses propres informations ou est admin
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Trouver l'utilisateur
    const user = await User.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Préparer les champs à mettre à jour
    const fieldsToUpdate = {};
    
    if (req.body.username !== undefined) fieldsToUpdate.username = req.body.username;
    if (req.body.email !== undefined) fieldsToUpdate.email = req.body.email;
    if (req.body.password !== undefined) fieldsToUpdate.password = req.body.password;
    
    // Seul un admin peut changer le rôle ou désactiver un compte
    if (req.user.role === 'admin') {
      if (req.body.role !== undefined) fieldsToUpdate.role = req.body.role;
      if (req.body.is_active !== undefined) fieldsToUpdate.is_active = req.body.is_active;
    }
    
    // Si aucun champ n'est fourni pour la mise à jour
    if (Object.keys(fieldsToUpdate).length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }
    
    // Mettre à jour l'utilisateur (le hook beforeUpdate se chargera de hacher le mot de passe)
    await user.update(fieldsToUpdate, { transaction });
    
    await transaction.commit();
    
    // Récupérer l'utilisateur mis à jour sans le mot de passe
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json({ 
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser
    });
  } catch (error) {
    await transaction.rollback();
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Cet email ou nom d\'utilisateur est déjà utilisé',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    console.error(`Error updating user ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error: error.message });
  }
};

/**
 * Supprimer un utilisateur
 * @route DELETE /api/users/:id
 * @access Admin uniquement
 */
export const deleteUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Seul un admin peut supprimer un utilisateur
    if (req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Trouver l'utilisateur
    const user = await User.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Supprimer l'utilisateur
    await user.destroy({ transaction });
    
    await transaction.commit();
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    await transaction.rollback();
    console.error(`Error deleting user ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error: error.message });
  }
};

/**
 * Changer le statut d'activation d'un utilisateur
 * @route PATCH /api/users/:id/status
 * @access Admin uniquement
 */
export const changeUserStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    // Vérifier que le statut est fourni
    if (is_active === undefined) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Le statut d\'activation est requis' });
    }
    
    // Seul un admin peut changer le statut d'un utilisateur
    if (req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Trouver l'utilisateur
    const user = await User.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Mettre à jour le statut
    await user.update({ is_active }, { transaction });
    
    await transaction.commit();
    
    res.json({ 
      message: `Compte utilisateur ${is_active ? 'activé' : 'désactivé'} avec succès`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_active: user.is_active
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error(`Error changing user status ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors du changement de statut de l\'utilisateur', error: error.message });
  }
};

/**
 * Récupérer les tickets d'un utilisateur
 * @route GET /api/users/:id/tickets
 * @access Admin ou l'utilisateur lui-même
 */
export const getUserTickets = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'utilisateur demande ses propres tickets ou est admin
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Vérifier si l'utilisateur existe
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Récupérer les tickets de l'utilisateur avec les informations sur les événements
    const tickets = await Ticket.findAll({
      where: { user_id: id },
      include: [{
        model: Event,
        as: 'event',
        include: [
          { association: 'venue' },
          { association: 'eventType' }
        ]
      }],
      order: [['purchase_date', 'DESC']]
    });
    
    res.json(tickets);
  } catch (error) {
    console.error(`Error fetching tickets for user ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets', error: error.message });
  }
};