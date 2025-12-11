// models/StockTransaction.js
const { DataTypes } = require("sequelize");
const sequelize = require('../config/database');

const StockTransaction = sequelize.define("StockTransaction", {
    transaction_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    
    // Foreign Key to the Inventory Item (What asset moved)
    item_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: 'InventoryItem', key: 'item_id' } 
    },
    
    // The quantity that moved (Positive for IN, Negative for OUT)
    quantity: { 
        type: DataTypes.INTEGER, 
        allowNull: false
    },
    
    // Type of transaction (e.g., 'IN_RECEIPT', 'OUT_ISSUE', 'ADJUST_PLUS', 'ADJUST_MINUS')
    type: { 
        type: DataTypes.ENUM('IN_RECEIPT', 'OUT_ISSUE', 'ADJUST_PLUS', 'ADJUST_MINUS', 'TRANSFER'),
        allowNull: false
    },

    // Source document ID (e.g., StockIn ID, or Asset Request ID, or Adjustment ID)
    source_document_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Not all transactions might link to a specific document (e.g., manual adjustment)
    },

    // A note about the transaction
    notes: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    // Record the current stock level *after* this transaction occurred
    current_stock_snapshot: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }

}, {
    tableName: 'StockTransaction',
    timestamps: true,
    indexes: [
        {
            fields: ['item_id', 'type'],
        }
    ]
});

module.exports = StockTransaction;