const { DataTypes } = require("sequelize");
const sequelize = require('../config/database');

const AssetRequest = sequelize.define("AssetRequest", {
    request_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    requester_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: 'Employee', key: 'emp_id' } 
    },
    
    // --> NEW FIELD: Categorizes the request type <--
    request_type: {
        type: DataTypes.ENUM('consumable_lab', 'fixed_asset_allocation', 'maintenance_repair', 'office_supply'),
        allowNull: true, // Can be optional if not categorized
    },
    
    purpose: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    destination_location: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'issued'),
        allowNull: false,
        defaultValue: 'pending' // Changed default from 'draft' to 'pending' as soon as it hits the controller
    },
    reviewed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'Employee', key: 'emp_id' }
    },
    review_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    item_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: 'InventoryItem', key: 'item_id' } 
    },
    quantity_requested: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    },
    quantity_issued: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 }
    }
}, {
    tableName: 'AssetRequest',
    timestamps: true,
});

module.exports = AssetRequest;