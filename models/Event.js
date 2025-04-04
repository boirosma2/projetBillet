import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class Event extends Model {}

Event.init({
  // ID auto-incrémenté
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  
  // Titre de l'événement
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [3, 100]
    }
  },
  
  // Description de l'événement
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 2000]
    }
  },
  
  // Date et heure de l'événement
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      // Vérifier que la date est dans le futur
      isFuture(value) {
        if (new Date(value) < new Date()) {
          throw new Error('La date de l\'événement doit être dans le futur');
        }
      }
    }
  },
  
  // Lieu de l'événement
  venue: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [3, 100]
    }
  },
  
  // Nombre total de tickets
  total_tickets: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  
  // Nombre de tickets disponibles
  available_tickets: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      // Vérifier que le nombre de tickets disponibles ne dépasse pas le total
      isLessThanTotal(value) {
        if (value > this.total_tickets) {
          throw new Error('Le nombre de tickets disponibles ne peut pas être supérieur au nombre total de tickets');
        }
      }
    }
  },
  
  // Prix des tickets
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  
  // Chemin de l'image principale (optionnel)
  image_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Statut de l'événement (upcoming, active, completed, cancelled)
  status: {
    type: DataTypes.ENUM('upcoming', 'active', 'completed', 'cancelled'),
    defaultValue: 'upcoming'
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
  modelName: 'Event',
  tableName: 'events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  // Hooks pour définir les valeurs par défaut
  hooks: {
    beforeCreate: (event) => {
      if (event.available_tickets === undefined) {
        event.available_tickets = event.total_tickets;
      }
    }
  }
});

export default Event;