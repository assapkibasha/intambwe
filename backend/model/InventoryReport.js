// models/InventoryReport.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryReport = sequelize.define('InventoryReport', {
  report_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  report_type: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'custom'),
    allowNull: false,
  },
  report_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  total_items: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  total_value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  low_stock_items_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  report_data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  generated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Employee', key: 'emp_id' }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'InventoryReport',
  timestamps: false,
});

module.exports = InventoryReport;
