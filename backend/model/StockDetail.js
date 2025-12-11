// models/StockDetail.js
const { DataTypes } = require("sequelize");
const sequelize = require('../config/database');

const StockDetail = sequelize.define("StockDetail", {
    stock_detail_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    
    // Foreign Key to StockIn (The header document)
    stock_in_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: 'StockIn', key: 'stock_in_id' } 
    },
    
    // Foreign Key to InventoryItem (The item received)
    item_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: 'InventoryItem', key: 'item_id' } 
    },
    
    quantity_received: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        defaultValue: 1 
    },
    
    unit_cost: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: true, // Cost might be unknown immediately
        defaultValue: 0.00
    },

    expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    
    location: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'Main Stock'
    }

}, {
    tableName: 'StockDetail',
    timestamps: true,
    indexes: [
        {
            fields: ['stock_in_id', 'item_id'],
            unique: false // Not unique, same item can be received multiple times in one document
        }
    ]
});

module.exports = StockDetail;