// models/InventoryLocation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryLocation = sequelize.define('InventoryLocation', {
  location_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  location_type: {
    type: DataTypes.ENUM('warehouse', 'store_room', 'classroom', 'office', 'other'),
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'InventoryLocation',
  timestamps: false,
});

module.exports = InventoryLocation;
