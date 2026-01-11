const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const StockOut = sequelize.define(
  "StockOut",
  {
    stock_outId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reference_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    issued_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    issued_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    issued_to_type: {
      type: DataTypes.ENUM("student", "department", "other"),
      allowNull: false,
      defaultValue: "other",
    },
    issued_to: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "issued", "cancelled"),
      allowNull: false,
      defaultValue: "issued",
    },
  },
  {
    tableName: "StockOut",
    timestamps: true,
    indexes: [
      {
        name: "idx_stockout_reference",
        fields: ["reference_number"],
      },
      {
        name: "idx_stockout_status",
        fields: ["status"],
      },
      {
        name: "idx_stockout_issued_by",
        fields: ["issued_by"],
      },
      {
        name: "idx_stockout_issued_date",
        fields: ["issued_date"],
      },
    ],
  }
);

module.exports = StockOut;
