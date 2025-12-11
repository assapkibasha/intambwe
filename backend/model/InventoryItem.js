// model/InventoryItem.js (CORRECTED)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryItem = sequelize.define('InventoryItem', {
    item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sku: { type: DataTypes.STRING(50), allowNull: false, unique: true }, 
    name: { type: DataTypes.STRING(255), allowNull: false }, 
    description: { type: DataTypes.TEXT, allowNull: true },
    category_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Category', key: 'category_id' } },
    default_supplier_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'Supplier', key: 'supplier_id' } },
    unit_of_measure: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'Unit' }, 
    is_serialized: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }, 
    
    // FIX HERE: Rename to current_stock
    current_stock: { // <-- RENAMED!
        type: DataTypes.INTEGER, 
        allowNull: false, 
        defaultValue: 0, 
        validate: { min: 0 } 
    }, 
    
    reorder_point: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5, validate: { min: 0 } },
}, {
    tableName: 'InventoryItem',
    timestamps: true
});

module.exports = InventoryItem;