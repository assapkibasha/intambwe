// models/ItemLocation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ItemLocation = sequelize.define('ItemLocation', {
  item_location_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'InventoryItem', key: 'item_id' }
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'InventoryLocation', key: 'location_id' }
  },
  quantity_in_location: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  bin_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'ItemLocation',
  timestamps: false,
});

module.exports = ItemLocation;
