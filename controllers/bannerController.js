import fs from 'fs';
import path from 'path';
import { Banner, Event } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { Op } from 'sequelize';

// Dans les environnements de test, process.env.NODE_ENV est généralement 'test'
// Utiliser une approche simple qui fonctionne à la fois en prod et en test
const uploadDir = path.join(process.cwd(), 'public/uploads');

// Helper pour construire l'URL de l'image
const getImageUrl = (req, imagePath) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${path.basename(imagePath)}`;
};

// Récupérer la bannière active
export const getActiveBanner = async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Rechercher une bannière active dont la période correspond à la date actuelle
    const banner = await Banner.findOne({
      where: {
        is_active: true,
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate }
      },
      include: [{
        model: Event,
        as: 'event',
        attributes: ['id', 'title']
      }],
      order: [['created_at', 'DESC']]
    });
    
    if (!banner) {
      return res.status(404).json({ message: 'Aucune bannière active trouvée' });
    }
    
    // Ajouter l'URL complète pour l'image
    const bannerJSON = banner.toJSON();
    bannerJSON.image_url = getImageUrl(req, banner.image_path);
    
    res.status(200).json(bannerJSON);
  } catch (error) {
    console.error('Erreur lors de la récupération de la bannière:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer toutes les bannières
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      include: [{
        model: Event,
        as: 'event',
        attributes: ['id', 'title']
      }],
      order: [['created_at', 'DESC']]
    });
    
    // Ajouter l'URL complète pour chaque image
    const bannersWithUrls = banners.map(banner => {
      const bannerObj = banner.toJSON();
      bannerObj.image_url = getImageUrl(req, banner.image_path);
      return bannerObj;
    });
    
    res.status(200).json(bannersWithUrls);
  } catch (error) {
    console.error('Erreur lors de la récupération des bannières:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Créer une nouvelle bannière
export const createBanner = async (req, res) => {
  // Utiliser une transaction pour garantir la cohérence des données
  const transaction = await sequelize.transaction();
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image téléchargée' });
    }
    
    const { event_id, title, start_date, end_date, is_active } = req.body;
    const activeBanner = is_active === 'true' || is_active === true;
    const image_path = req.file.filename;
    
    // Validation des données
    if (!title || !start_date || !end_date) {
      // Supprimer le fichier si on rencontre une erreur
      fs.unlinkSync(path.join(uploadDir, image_path));
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
    }
    
    // Vérifier que l'événement existe si un event_id est fourni
    if (event_id) {
      const event = await Event.findByPk(event_id, { transaction });
      if (!event) {
        // Supprimer le fichier si on rencontre une erreur
        fs.unlinkSync(path.join(uploadDir, image_path));
        await transaction.rollback();
        return res.status(404).json({ message: 'Événement non trouvé' });
      }
    }
    
    // Si la bannière doit être active, désactiver toutes les autres bannières
    if (activeBanner) {
      await Banner.update(
        { is_active: false },
        { where: {}, transaction }
      );
    }
    
    // Créer la bannière dans la base de données
    const banner = await Banner.create({
      event_id: event_id || null,
      image_path,
      title,
      start_date,
      end_date,
      is_active: activeBanner,
      display_order: 0 // Valeur par défaut
    }, { transaction });
    
    // Valider la transaction
    await transaction.commit();
    
    // Préparer la réponse
    const bannerJSON = banner.toJSON();
    bannerJSON.image_url = getImageUrl(req, image_path);
    
    res.status(201).json({ 
      message: 'Bannière créée avec succès',
      banner: bannerJSON
    });
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await transaction.rollback();
    
    // En cas d'erreur, supprimer le fichier uploadé
    if (req.file) {
      try {
        fs.unlinkSync(path.join(uploadDir, req.file.filename));
      } catch (err) {
        console.error('Erreur lors de la suppression du fichier:', err);
      }
    }
    
    console.error('Erreur lors de la création de la bannière:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Mettre à jour une bannière
export const updateBanner = async (req, res) => {
  // Utiliser une transaction pour garantir la cohérence des données
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { event_id, title, start_date, end_date, is_active } = req.body;
    
    // Vérifier si la bannière existe
    const banner = await Banner.findByPk(id, { transaction });
    if (!banner) {
      if (req.file) {
        fs.unlinkSync(path.join(uploadDir, req.file.filename));
      }
      await transaction.rollback();
      return res.status(404).json({ message: 'Bannière non trouvée' });
    }
    
    let image_path = banner.image_path;
    
    // Déterminer si la bannière doit être active
    const activeBanner = is_active === 'true' || is_active === true;
    const isActivating = activeBanner && !banner.is_active;
    
    // Si une nouvelle image est téléchargée, supprimer l'ancienne
    if (req.file) {
      // Supprimer l'ancienne image
      try {
        fs.unlinkSync(path.join(uploadDir, banner.image_path));
      } catch (err) {
        console.error('Erreur lors de la suppression de l\'ancienne image:', err);
        // Continuer malgré l'erreur de suppression
      }
      
      // Utiliser la nouvelle image
      image_path = req.file.filename;
    }
    
    // Vérifier que l'événement existe si un event_id est fourni
    if (event_id) {
      const event = await Event.findByPk(event_id, { transaction });
      if (!event) {
        if (req.file) {
          fs.unlinkSync(path.join(uploadDir, req.file.filename));
        }
        await transaction.rollback();
        return res.status(404).json({ message: 'Événement non trouvé' });
      }
    }
    
    // Si la bannière est activée, désactiver toutes les autres bannières
    if (isActivating) {
      await Banner.update(
        { is_active: false },
        { where: {}, transaction }
      );
    }
    
    // Préparer les données pour la mise à jour
    const updateData = {
      image_path,
      event_id: event_id !== undefined ? (event_id || null) : banner.event_id,
      title: title || banner.title,
      start_date: start_date || banner.start_date,
      end_date: end_date || banner.end_date,
      is_active: is_active !== undefined ? activeBanner : banner.is_active
    };
    
    // Mettre à jour la bannière
    await banner.update(updateData, { transaction });
    
    // Récupérer la bannière mise à jour avec ses relations
    const updatedBanner = await Banner.findByPk(id, {
      include: [{
        model: Event,
        as: 'event',
        attributes: ['id', 'title']
      }],
      transaction
    });
    
    // Valider la transaction
    await transaction.commit();
    
    // Préparer la réponse
    const bannerJSON = updatedBanner.toJSON();
    bannerJSON.image_url = getImageUrl(req, updatedBanner.image_path);
    
    res.status(200).json({ 
      message: 'Bannière mise à jour avec succès',
      banner: bannerJSON
    });
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await transaction.rollback();
    
    // En cas d'erreur avec une nouvelle image, supprimer le fichier uploadé
    if (req.file) {
      try {
        fs.unlinkSync(path.join(uploadDir, req.file.filename));
      } catch (err) {
        console.error('Erreur lors de la suppression du fichier:', err);
      }
    }
    
    console.error('Erreur lors de la mise à jour de la bannière:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer une bannière
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si la bannière existe
    const banner = await Banner.findByPk(id);
    if (!banner) {
      return res.status(404).json({ message: 'Bannière non trouvée' });
    }
    
    // Supprimer l'image associée
    try {
      fs.unlinkSync(path.join(uploadDir, banner.image_path));
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'image:', err);
      // Continuer malgré l'erreur de suppression du fichier
    }
    
    // Supprimer la bannière de la base de données
    await banner.destroy();
    
    res.status(200).json({ message: 'Bannière supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la bannière:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};