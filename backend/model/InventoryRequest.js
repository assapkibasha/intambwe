// models/InventoryRequest.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryRequest = sequelize.define('InventoryRequest', {
  request_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'InventoryItem', key: 'item_id' }
  },
  requester_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Employee', key: 'emp_id' }
  },
  quantity_requested: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  quantity_approved: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending','approved','rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Employee', key: 'emp_id' }
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'InventoryRequest',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = InventoryRequest;
