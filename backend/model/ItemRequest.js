const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ItemRequest = sequelize.define('ItemRequest', {
  request_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // The item being requested
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'InventoryItem', key: 'item_id' }
  },
  // The employee who made the request
  requester_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Employee', key: 'emp_id' }
  },
  // Quantity requested
  quantity_requested: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 }
  },
  // Quantity actually approved
  quantity_approved: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Reason/justification for the request
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Request status: pending, approved, rejected, confirmed
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'confirmed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  // The employee who approved/rejected the request
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Employee', key: 'emp_id' }
  },
  // When the request was approved/rejected
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // When it was confirmed/fulfilled
  confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Notes from approver
  approval_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'ItemRequest',
  timestamps: true,
  underscored: true
});

module.exports = ItemRequest;
