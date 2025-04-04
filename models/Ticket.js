import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class Ticket extends Model {}

Ticket.init({
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
  
  // Référence à l'utilisateur (sera définie par une association)
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  
  // Code unique du ticket
  ticket_code: {
    type: DataTypes.STRING,
    unique: true
  },
  
  // Statut du ticket (reserved, paid, cancelled, used)
  status: {
    type: DataTypes.ENUM('reserved', 'paid', 'cancelled', 'used'),
    defaultValue: 'paid'
  },
  
  // Prix payé (peut être différent du prix actuel de l'événement si celui-ci change)
  price_paid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  
  // Date d'achat
  purchase_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
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
  modelName: 'Ticket',
  tableName: 'tickets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  // Hooks pour générer un code de ticket unique
  hooks: {
    beforeCreate: (ticket) => {
      // Générer un code unique pour le ticket
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const timestamp = Date.now().toString(36).toUpperCase();
      ticket.ticket_code = `TIX-${random}-${timestamp}`;
    }
  }
});

export default Ticket;