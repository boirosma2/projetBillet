import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class Venue extends Model {}

Venue.init({
  // ID auto-incrémenté
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  
  // Nom du lieu
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  
  // Adresse complète
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [5, 255]
    }
  },
  
  // Référence à la ville (sera définie par une association)
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cities',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  
  // Capacité d'accueil du lieu
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  
  // Description supplémentaire (optionnelle)
  description: {
    type: DataTypes.TEXT,
    allowNull: true
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
  modelName: 'Venue',
  tableName: 'venues',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Venue;