import { Banner, Event, BannerClick, User } from '../models/index.js';
import { sequelize } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';

/**
 * Récupérer toutes les bannières
 * @route GET /api/banners
 * @access Admin
 */
export const getAllBanners = async (req, res) => {
  try {
    // Vérifier le rôle administrateur
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const banners = await Banner.findAll({
      include: [{
        model: Event,
        as: 'event'
      }],
      order: [['display_order', 'ASC'], ['created_at', 'DESC']]
    });
    
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des bannières', error: error.message });
  }
};

/**
 * Récupérer la bannière active
 * @route GET /api/banners/active
 * @access Public
 */
export const getActiveBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne({
      where: { is_active: true },
      include: [{
        model: Event,
        as: 'event'
      }]
    });
    
    if (!banner) {
      return res.status(404).json({ message: 'Aucune bannière active trouvée' });
    }
    
    res.json(banner);
  } catch (error) {
    console.error('Error fetching active banner:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la bannière active', error: error.message });
  }
};

/**
 * Récupérer toutes les bannières actives pour l'affichage frontend
 * @route GET /api/banners/featured
 * @access Public
 */
export const getFeaturedBanners = async (req, res) => {
  try {
    const now = new Date();
    
    const banners = await Banner.findAll({
      where: { 
        is_active: true,
        [Op.and]: [
          {
            [Op.or]: [
              { start_date: null },
              { start_date: { [Op.lte]: now } }
            ]
          },
          {
            [Op.or]: [
              { end_date: null },
              { end_date: { [Op.gte]: now } }
            ]
          }
        ]
      },
      include: [{
        model: Event,
        as: 'event',
        attributes: ['id', 'title', 'date', 'image_path']
      }],
      order: [['display_order', 'ASC']]
    });
    
    res.json(banners);
  } catch (error) {
    console.error('Error fetching featured banners:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des bannières', error: error.message });
  }
};

/**
 * Récupérer une bannière par son ID
 * @route GET /api/banners/:id
 * @access Admin
 */
export const getBannerById = async (req, res) => {
  try {
    // Vérifier le rôle administrateur
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const { id } = req.params;
    const banner = await Banner.findByPk(id, {
      include: [{
        model: Event,
        as: 'event'
      }]
    });
    
    if (!banner) {
      return res.status(404).json({ message: 'Bannière non trouvée' });
    }
    
    res.json(banner);
  } catch (error) {
    console.error(`Error fetching banner ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la bannière', error: error.message });
  }
};

/**
 * Créer une nouvelle bannière
 * @route POST /api/banners
 * @access Admin
 */
export const createBanner = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Vérifier le rôle administrateur
    if (req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const { title, description, event_id, is_active, start_date, end_date, display_order } = req.body;
    
    if (!req.file) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Une image est requise' });
    }
    
    const image_path = `/uploads/${req.file.filename}`;
    
    // Vérifier si l'événement existe (si fourni)
    if (event_id) {
      const event = await Event.findByPk(event_id, { transaction });
      if (!event) {
        await transaction.rollback();
        // Supprimer le fichier téléchargé
        fs.unlink(path.join(process.cwd(), 'public', image_path), (err) => {
          if (err) console.error('Error deleting file:', err);
        });
        return res.status(404).json({ message: 'Événement non trouvé' });
      }
    }
    
    // Si cette bannière doit être active, désactiver toutes les autres
    if (is_active) {
      await Banner.update(
        { is_active: false },
        { where: {}, transaction }
      );
    }
    
    // Créer la bannière
    const banner = await Banner.create({
      title,
      description,
      image_path,
      event_id: event_id || null,
      is_active: is_active || false,
      start_date: start_date || null,
      end_date: end_date || null,
      display_order: display_order || 0
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({ 
      message: 'Bannière créée avec succès',
      banner
    });
  } catch (error) {
    await transaction.rollback();
    
    if (req.file) {
      // Supprimer le fichier en cas d'erreur
      const filePath = path.join(process.cwd(), 'public', `/uploads/${req.file.filename}`);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    console.error('Error creating banner:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la bannière', error: error.message });
  }
};

/**
 * Activer une bannière
 * @route PATCH /api/banners/:id/activate
 * @access Admin
 */
export const activateBanner = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Vérifier le rôle administrateur
    if (req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const { id } = req.params;
    
    // Vérifier si la bannière existe
    const banner = await Banner.findByPk(id, { transaction });
    if (!banner) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Bannière non trouvée' });
    }
    
    // Désactiver toutes les bannières
    await Banner.update(
      { is_active: false },
      { where: {}, transaction }
    );
    
    // Activer celle-ci
    await banner.update({ is_active: true }, { transaction });
    
    await transaction.commit();
    
    res.json({
      message: 'Bannière activée avec succès',
      banner
    });
  } catch (error) {
    await transaction.rollback();
    console.error(`Error activating banner ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de l\'activation de la bannière', error: error.message });
  }
};

/**
 * Mettre à jour une bannière
 * @route PUT /api/banners/:id
 * @access Admin
 */
export const updateBanner = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Vérifier le rôle administrateur
    if (req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const { id } = req.params;
    const { title, description, event_id, is_active, start_date, end_date, display_order } = req.body;
    
    // Vérifier si la bannière existe
    const banner = await Banner.findByPk(id, { transaction });
    if (!banner) {
      await transaction.rollback();
      // Supprimer le fichier téléchargé si présent
      if (req.file) {
        fs.unlink(path.join(process.cwd(), 'public', `/uploads/${req.file.filename}`), (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      return res.status(404).json({ message: 'Bannière non trouvée' });
    }
    
    // Vérifier si l'événement existe (si fourni)
    if (event_id) {
      const event = await Event.findByPk(event_id, { transaction });
      if (!event) {
        await transaction.rollback();
        // Supprimer le fichier téléchargé si présent
        if (req.file) {
          fs.unlink(path.join(process.cwd(), 'public', `/uploads/${req.file.filename}`), (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        }
        return res.status(404).json({ message: 'Événement non trouvé' });
      }
    }
    
    // Préparer les champs à mettre à jour
    const fieldsToUpdate = {};
    
    if (title !== undefined) fieldsToUpdate.title = title;
    if (description !== undefined) fieldsToUpdate.description = description;
    if (event_id !== undefined) fieldsToUpdate.event_id = event_id || null;
    if (start_date !== undefined) fieldsToUpdate.start_date = start_date || null;
    if (end_date !== undefined) fieldsToUpdate.end_date = end_date || null;
    if (display_order !== undefined) fieldsToUpdate.display_order = display_order;
    
    if (req.file) {
      fieldsToUpdate.image_path = `/uploads/${req.file.filename}`;
      
      // Stocker l'ancienne image pour la supprimer après
      const oldImagePath = banner.image_path;
      
      // Après la mise à jour réussie, nous supprimerons l'ancienne image
      if (oldImagePath && oldImagePath !== fieldsToUpdate.image_path) {
        const oldFilePath = path.join(process.cwd(), 'public', oldImagePath);
        fs.unlink(oldFilePath, (err) => {
          if (err && err.code !== 'ENOENT') console.error('Error deleting old file:', err);
        });
      }
    }
    
    // Si on veut activer cette bannière et qu'elle n'est pas déjà active
    if (is_active && !banner.is_active) {
      // Désactiver toutes les bannières
      await Banner.update(
        { is_active: false },
        { where: {}, transaction }
      );
      
      fieldsToUpdate.is_active = true;
    } else if (is_active !== undefined) {
      fieldsToUpdate.is_active = is_active;
    }
    
    // Si aucun champ n'est fourni pour la mise à jour
    if (Object.keys(fieldsToUpdate).length === 0) {
      await transaction.rollback();
      // Supprimer le fichier téléchargé si présent
      if (req.file) {
        fs.unlink(path.join(process.cwd(), 'public', `/uploads/${req.file.filename}`), (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }
    
    // Mettre à jour la bannière
    await banner.update(fieldsToUpdate, { transaction });
    
    await transaction.commit();
    
    // Récupérer la bannière mise à jour
    const updatedBanner = await Banner.findByPk(id, {
      include: [{
        model: Event,
        as: 'event'
      }]
    });
    
    res.json({
      message: 'Bannière mise à jour avec succès',
      banner: updatedBanner
    });
  } catch (error) {
    await transaction.rollback();
    
    if (req.file) {
      // Supprimer le fichier en cas d'erreur
      const filePath = path.join(process.cwd(), 'public', `/uploads/${req.file.filename}`);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    console.error(`Error updating banner ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la bannière', error: error.message });
  }
};

/**
 * Mettre à jour l'ordre des bannières
 * @route PATCH /api/banners/order
 * @access Admin
 */
export const updateBannerOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Vérifier le rôle administrateur
    if (req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const { bannerOrders } = req.body;
    
    if (!Array.isArray(bannerOrders)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Format invalide pour l\'ordre des bannières' });
    }
    
    // Mettre à jour l'ordre de chaque bannière
    for (const item of bannerOrders) {
      const { id, order } = item;
      
      if (!id || typeof order !== 'number') continue;
      
      await Banner.update(
        { display_order: order },
        { where: { id }, transaction }
      );
    }
    
    await transaction.commit();
    
    // Récupérer les bannières mises à jour
    const updatedBanners = await Banner.findAll({
      order: [['display_order', 'ASC']]
    });
    
    res.json({
      message: 'Ordre des bannières mis à jour avec succès',
      banners: updatedBanners
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating banner order:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'ordre des bannières', error: error.message });
  }
};

/**
 * Supprimer une bannière
 * @route DELETE /api/banners/:id
 * @access Admin
 */
export const deleteBanner = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Vérifier le rôle administrateur
    if (req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const { id } = req.params;
    
    // Vérifier si la bannière existe
    const banner = await Banner.findByPk(id, { transaction });
    if (!banner) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Bannière non trouvée' });
    }
    
    // Stocker le chemin de l'image pour la supprimer après
    const imagePath = banner.image_path;
    
    // Supprimer la bannière
    await banner.destroy({ transaction });
    
    await transaction.commit();
    
    // Supprimer l'image
    if (imagePath) {
      const filePath = path.join(process.cwd(), 'public', imagePath);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error deleting file:', err);
      });
    }
    
    res.json({ message: 'Bannière supprimée avec succès' });
  } catch (error) {
    await transaction.rollback();
    console.error(`Error deleting banner ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la bannière', error: error.message });
  }
};

/**
 * Suivre un clic sur une bannière
 * @route POST /api/banners/:id/click
 * @access Public
 */
export const trackBannerClick = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si la bannière existe
    const banner = await Banner.findByPk(id);
    if (!banner) {
      return res.status(404).json({ message: 'Bannière non trouvée' });
    }
    
    // Enregistrer le clic
    await BannerClick.create({
      banner_id: id,
      user_id: req.user ? req.user.id : null,
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });
    
    // Si la bannière est liée à un événement, renvoyer l'URL pour redirection
    if (banner.event_id) {
      return res.json({
        success: true,
        redirect_url: `/events/${banner.event_id}`
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error tracking banner click ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors du suivi du clic sur la bannière', error: error.message });
  }
};

/**
 * Obtenir les statistiques d'une bannière
 * @route GET /api/banners/:id/stats
 * @access Admin
 */
export const getBannerStats = async (req, res) => {
  try {
    // Vérifier le rôle administrateur
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    // Vérifier si la bannière existe
    const banner = await Banner.findByPk(id);
    if (!banner) {
      return res.status(404).json({ message: 'Bannière non trouvée' });
    }
    
    const whereClause = { banner_id: id };
    
    if (startDate && endDate) {
      whereClause.clicked_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    // Compter les clics
    const totalClicks = await BannerClick.count({
      where: whereClause
    });
    
    // Clics par jour
    const clicksByDay = await BannerClick.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('clicked_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'clicks']
      ],
      where: whereClause,
      group: [sequelize.fn('DATE', sequelize.col('clicked_at'))],
      order: [[sequelize.literal('date'), 'ASC']]
    });
    
    // Clics par utilisateur (anonymes vs connectés)
    const clicksByUserType = await BannerClick.findAll({
      attributes: [
        [sequelize.literal('CASE WHEN user_id IS NULL THEN \'anonymous\' ELSE \'registered\' END'), 'user_type'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'clicks']
      ],
      where: whereClause,
      group: [sequelize.literal('CASE WHEN user_id IS NULL THEN \'anonymous\' ELSE \'registered\' END')]
    });
    
    res.json({
      banner_id: id,
      banner_title: banner.title,
      total_clicks: totalClicks,
      clicks_by_day: clicksByDay,
      clicks_by_user_type: clicksByUserType
    });
  } catch (error) {
    console.error(`Error fetching banner stats ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques de la bannière', error: error.message });
  }
};