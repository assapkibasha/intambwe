// model/Supplier.js
const { DataTypes } = require("sequelize");
const sequelize = require('../config/database');

const Supplier = sequelize.define("Supplier", {
    supplier_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    supplier_name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    contact_person: { type: DataTypes.STRING(100) },
    email: { type: DataTypes.STRING(100), unique: true },
    phone_number: { type: DataTypes.STRING(50) },
    address: { type: DataTypes.TEXT },
}, {
    tableName: 'Supplier',
    timestamps: true
});

module.exports = Supplier;