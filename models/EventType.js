import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class EventType extends Model {}

EventType.init({
  // ID auto-incrémenté
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  
  // Nom du type d'événement (concert, festival, théâtre, etc.)
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 50]
    }
  },
  
  // Description optionnelle
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
  modelName: 'EventType',
  tableName: 'event_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default EventType;