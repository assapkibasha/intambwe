const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RequestAsset = sequelize.define(
  "RequestAsset",
  {
    request_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    inventory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requested_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    request_status: {
      type: DataTypes.ENUM(
        "PENDING",
        "APPROVED",
        "REJECTED",
        "UNAVAILABLE",
        "RETURNED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },
    requested_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "employee",
        key: "emp_id",
      },
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "employee",
        key: "emp_id",
      },
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    request_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "requestAsset",
    timestamps: false,
  }
);

module.exports = RequestAsset;
