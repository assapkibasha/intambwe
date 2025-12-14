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
    },

    request_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    performed_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
