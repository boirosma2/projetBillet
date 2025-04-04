import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';

class User extends Model {
  // Méthode pour comparer les mots de passe
  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

User.init({
  // ID auto-incrémenté
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  
  // Nom d'utilisateur
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30],
      isAlphanumeric: true
    }
  },
  
  // Adresse email
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  
  // Mot de passe (haché)
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // Rôle utilisateur (regular, admin)
  role: {
    type: DataTypes.ENUM('regular', 'admin'),
    defaultValue: 'regular'
  },
  
  // Statut du compte
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  // Hooks pour hasher le mot de passe avant la création/mise à jour
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

export default User;