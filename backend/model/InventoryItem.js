// model/InventoryItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryItem = sequelize.define('InventoryItem', {
    item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sku: { type: DataTypes.STRING(50), allowNull: false, unique: true }, // Stock Keeping Unit
    name: { type: DataTypes.STRING(255), allowNull: false }, // ✅ This is 'name', not 'item_name'
    description: { type: DataTypes.TEXT, allowNull: true },
    category_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Category', key: 'category_id' } },
    default_supplier_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'Supplier', key: 'supplier_id' } },
    unit_of_measure: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'Unit' }, // ✅ This is 'unit_of_measure'
    is_serialized: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }, // Does it require tracking by SN?
    current_stock_level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
    reorder_point: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5, validate: { min: 0 } },
}, {
    tableName: 'InventoryItem',
    timestamps: true
});

module.exports = InventoryItem;