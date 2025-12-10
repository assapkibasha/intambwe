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
  barcode: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
  },
  qr_code: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Category', key: 'category_id' }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  minimum_stock_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 10,
  },
  unit_type: {
    type: DataTypes.ENUM('pieces', 'boxes', 'kg', 'liters', 'meters', 'other'),
    allowNull: false,
    defaultValue: 'pieces',
  },
  quantity_per_unit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Supplier', key: 'supplier_id' }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  warranty_expiry_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  purchase_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  depreciation_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'discontinued'),
    allowNull: false,
    defaultValue: 'active',
  },
  added_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Employee', key: 'emp_id' }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'InventoryItem',
  timestamps: false,
});

module.exports = InventoryItem;
