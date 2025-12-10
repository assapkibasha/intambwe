// models/PurchaseOrderItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
  po_item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  po_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'PurchaseOrder', key: 'po_id' }
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'InventoryItem', key: 'item_id' }
  },
  quantity_ordered: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity_received: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  line_total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  }
}, {
  tableName: 'PurchaseOrderItem',
  timestamps: false,
});

module.exports = PurchaseOrderItem;
