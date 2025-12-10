// models/StockAdjustment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockAdjustment = sequelize.define('StockAdjustment', {
  adjustment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'InventoryItem', key: 'item_id' }
  },
  adjustment_type: {
    type: DataTypes.ENUM('damaged', 'lost', 'expired', 'return', 'correction'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reference_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  adjusted_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Employee', key: 'emp_id' }
  },
  adjustment_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'StockAdjustment',
  timestamps: false,
});

module.exports = StockAdjustment;
