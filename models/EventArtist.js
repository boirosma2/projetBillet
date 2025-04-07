import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class EventArtist extends Model {}

EventArtist.init({
  // ID auto-incrémenté
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  
  // Référence à l'événement (sera définie par une association)
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  
  // Référence à l'artiste (sera définie par une association)
  artist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'artists',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  
  // Position dans le lineup (headliner, support, etc.)
  position: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  // Heure de passage prévue
  performance_time: {
    type: DataTypes.DATE,
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
  modelName: 'EventArtist',
  tableName: 'event_artists',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  // Indices pour améliorer les performances
  indexes: [
    {
      unique: true,
      fields: ['event_id', 'artist_id']
    }
  ]
});

export default EventArtist;