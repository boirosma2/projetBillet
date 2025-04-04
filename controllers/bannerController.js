import db from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../public/uploads');

// Récupérer la bannière active
export const getActiveBanner = async (req, res) => {
  try {
    const currentDate = new Date().toISOString();
    console.log("Date actuelle:", currentDate);
    
    // Rechercher une bannière active dont la période correspond à la date actuelle
    const result = await db.query(
      `SELECT b.*, e.title as event_title 
       FROM banners b
       LEFT JOIN events e ON b.event_id = e.id
       WHERE b.is_active = true 
       ORDER BY b.created_at DESC
       LIMIT 1`
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Aucune bannière active trouvée' });
    }
    
    const banner = result.rows[0];
    
    // Construire l'URL complète pour l'image
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    banner.image_url = `${baseUrl}/uploads/${path.basename(banner.image_path)}`;
    
    res.status(200).json(banner);
  } catch (error) {
    console.error('Erreur lors de la récupération de la bannière:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer toutes les bannières
export const getAllBanners = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*, e.title as event_title 
       FROM banners b
       LEFT JOIN events e ON b.event_id = e.id
       ORDER BY b.created_at DESC`
    );
    
    const banners = result.rows;
    
    // Ajouter l'URL complète pour chaque image
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    banners.forEach(banner => {
      banner.image_url = `${baseUrl}/uploads/${path.basename(banner.image_path)}`;
    });
    
    res.status(200).json(banners);
  } catch (error) {
    console.error('Erreur lors de la récupération des bannières:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Créer une nouvelle bannière
export const createBanner = async (req, res) => {
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
      const eventResult = await db.query('SELECT * FROM events WHERE id = $1', [event_id]);
      if (eventResult.rows.length === 0) {
        // Supprimer le fichier si on rencontre une erreur
        fs.unlinkSync(path.join(uploadDir, image_path));
        return res.status(404).json({ message: 'Événement non trouvé' });
      }
    }
    
    // Si la bannière doit être active, désactiver toutes les autres bannières
    if (activeBanner) {
      await db.query('UPDATE banners SET is_active = false');
    }
    
    // Insérer la bannière dans la base de données
    const result = await db.query(
      `INSERT INTO banners (event_id, image_path, title, start_date, end_date, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [event_id || null, image_path, title, start_date, end_date, activeBanner]
    );
    
    const banner = result.rows[0];
    
    // Construire l'URL complète pour l'image
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    banner.image_url = `${baseUrl}/uploads/${path.basename(banner.image_path)}`;
    
    res.status(201).json({ 
      message: 'Bannière créée avec succès',
      banner
    });
  } catch (error) {
    // En cas d'erreur, supprimer le fichier uploadé
    if (req.file) {
      fs.unlinkSync(path.join(uploadDir, req.file.filename));
    }
    
    console.error('Erreur lors de la création de la bannière:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Mettre à jour une bannière
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { event_id, title, start_date, end_date, is_active } = req.body;
    
    // Vérifier si la bannière existe
    const bannerResult = await db.query('SELECT * FROM banners WHERE id = $1', [id]);
    if (bannerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Bannière non trouvée' });
    }
    
    const oldBanner = bannerResult.rows[0];
    let image_path = oldBanner.image_path;
    
    // Déterminer si la bannière doit être active
    const activeBanner = is_active === 'true' || is_active === true;
    const isActivating = activeBanner && !oldBanner.is_active;
    
    // Si une nouvelle image est téléchargée, supprimer l'ancienne
    if (req.file) {
      // Supprimer l'ancienne image
      try {
        fs.unlinkSync(path.join(uploadDir, oldBanner.image_path));
      } catch (err) {
        console.error('Erreur lors de la suppression de l\'ancienne image:', err);
      }
      
      // Utiliser la nouvelle image
      image_path = req.file.filename;
    }
    
    // Vérifier que l'événement existe si un event_id est fourni
    if (event_id) {
      const eventResult = await db.query('SELECT * FROM events WHERE id = $1', [event_id]);
      if (eventResult.rows.length === 0) {
        return res.status(404).json({ message: 'Événement non trouvé' });
      }
    }
    
    // Si la bannière est activée, désactiver toutes les autres bannières
    if (isActivating) {
      await db.query('UPDATE banners SET is_active = false');
    }
    
    // Mettre à jour la bannière
    const result = await db.query(
      `UPDATE banners
       SET event_id = $1, 
           image_path = $2, 
           title = $3, 
           start_date = $4, 
           end_date = $5, 
           is_active = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        event_id !== undefined ? event_id : oldBanner.event_id, 
        image_path,
        title || oldBanner.title,
        start_date || oldBanner.start_date,
        end_date || oldBanner.end_date,
        is_active !== undefined ? activeBanner : oldBanner.is_active,
        id
      ]
    );
    
    const banner = result.rows[0];
    
    // Construire l'URL complète pour l'image
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    banner.image_url = `${baseUrl}/uploads/${path.basename(banner.image_path)}`;
    
    res.status(200).json({ 
      message: 'Bannière mise à jour avec succès',
      banner
    });
  } catch (error) {
    // En cas d'erreur avec une nouvelle image, supprimer le fichier uploadé
    if (req.file) {
      fs.unlinkSync(path.join(uploadDir, req.file.filename));
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
    const result = await db.query('SELECT * FROM banners WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bannière non trouvée' });
    }
    
    const banner = result.rows[0];
    
    // Supprimer l'image associée
    try {
      fs.unlinkSync(path.join(uploadDir, banner.image_path));
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'image:', err);
      // Continuer malgré l'erreur de suppression du fichier
    }
    
    // Supprimer la bannière de la base de données
    await db.query('DELETE FROM banners WHERE id = $1', [id]);
    
    res.status(200).json({ message: 'Bannière supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la bannière:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};