// models/InventoryItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryItem = sequelize.define('InventoryItem', {
  item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  stock_keeping_unit: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  added_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Employee', key: 'emp_id' }
  }
}, {
  tableName: 'InventoryItem',
  timestamps: false,
});

module.exports = InventoryItem;
