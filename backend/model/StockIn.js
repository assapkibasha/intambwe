// model/StockIn.js
const { DataTypes } = require("sequelize");
const sequelize = require('../config/database');

const StockIn = sequelize.define("StockIn", {
    stock_in_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    supplier_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Supplier', key: 'supplier_id' } },
    reference_number: { type: DataTypes.STRING(100), allowNull: true, unique: true }, // Delivery Note, Invoice, or PO reference
    received_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    received_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Employee', key: 'emp_id' } },
    notes: { type: DataTypes.TEXT, allowNull: true },
    // 👇 CRUCIAL: Add Status to track the lifecycle of the document
    status: {
        type: DataTypes.ENUM('draft', 'received', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft',
    },
}, {
    tableName: 'StockIn',
    timestamps: true
});

module.exports = StockIn;