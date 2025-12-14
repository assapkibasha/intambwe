const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TransactionReport = sequelize.define(
  "TransactionReport",
  {
    transaction_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    inventory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "inventory",
        key: "inventory_id",
      },
    },
    request_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "RequestAsset",
        key: "request_id",
      },
    },
    performed_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Employee",
        key: "emp_id",
      },
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "transaction_report",
    timestamps: false,
  }
);

module.exports = TransactionReport;
