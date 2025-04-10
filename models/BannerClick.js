import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

class BannerClick extends Model {}

BannerClick.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  banner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'banners',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  clicked_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'BannerClick',
  tableName: 'banner_clicks',
  timestamps: false
});

export default BannerClick;