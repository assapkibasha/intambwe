const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee'); // Assuming you have an Employee model
const InventoryItem = require('./InventoryItem'); // Assuming you create this model

const AssetRequest = sequelize.define('AssetRequest', {
    request_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // The employee who made the request
    requester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Employee', key: 'emp_id' }
    },
    // The item being requested
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // Assuming 'InventoryItem' model is created and has 'item_id'
        references: { model: 'InventoryItem', key: 'item_id' } 
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    },
    justification: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Confirmed'),
        defaultValue: 'Pending',
        allowNull: false,
    },
    // The employee who processed the request (Manager/Admin)
    processed_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'Employee', key: 'emp_id' }
    },
    processed_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'AssetRequest',
    timestamps: true,
    createdAt: 'requested_at',
    updatedAt: 'updated_at',
});

// Define associations (must be done after models are defined)
// AssetRequest.belongsTo(Employee, { foreignKey: 'requester_id', as: 'Requester' });
// AssetRequest.belongsTo(Employee, { foreignKey: 'processed_by_id', as: 'Processor' });
// AssetRequest.belongsTo(InventoryItem, { foreignKey: 'item_id', as: 'RequestedItem' });

module.exports = AssetRequest;