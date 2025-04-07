import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class Artist extends Model {}

Artist.init({
  // ID auto-incrémenté
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  
  // Nom de l'artiste
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  
  // Genre musical/artistique
  genre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  
  // Biographie (optionnelle)
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Image/photo (optionnelle)
  image_path: {
    type: DataTypes.STRING,
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
  modelName: 'Artist',
  tableName: 'artists',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Artist;