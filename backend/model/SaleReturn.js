const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SaleReturn = sequelize.define(
  "SaleReturn",
  {
    return_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    return_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Sale",
        key: "sale_id",
      },
    },
    return_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "completed",
    },
    returned_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refund_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "SaleReturn",
    timestamps: true,
    indexes: [
      {
        name: "idx_return_sale",
        fields: ["sale_id"],
      },
      {
        name: "idx_return_date",
        fields: ["return_date"],
      },
      {
        name: "idx_return_status",
        fields: ["status"],
      },
    ],
  }
);

module.exports = SaleReturn;
