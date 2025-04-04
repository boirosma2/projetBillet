import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class Banner extends Model {}

Banner.init({
  // ID auto-incrémenté
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  
  // Référence à l'événement (optionnel, sera définie par une association)
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'events',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  
  // Chemin de l'image
  image_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // Titre de la bannière
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [3, 100]
    }
  },
  
  // Date de début d'affichage
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  
  // Date de fin d'affichage
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfterStartDate(value) {
        if (new Date(value) <= new Date(this.start_date)) {
          throw new Error('La date de fin doit être postérieure à la date de début');
        }
      }
    }
  },
  
  // Statut d'activation
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // URL externe (optionnel)
  external_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  
  // Priorité d'affichage
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Dates de création et de mise à jour automatiques
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Banner',
  tableName: 'banners',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  // Getter virtuel pour l'URL complète de l'image
  getterMethods: {
    image_url() {
      if (!this.image_path) return null;
      
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      return `${baseUrl}/uploads/${this.image_path.split('/').pop()}`;
    }
  }
});

export default Banner;