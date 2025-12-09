// models/StockTransaction.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockTransaction = sequelize.define('StockTransaction', {
  transaction_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'InventoryItem', key: 'item_id' }
  },
  type: {
    type: DataTypes.ENUM('in','out'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  performed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Employee', key: 'emp_id' }
  },
  reference: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'StockTransaction',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = StockTransaction;
