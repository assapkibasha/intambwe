const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sale = sequelize.define(
  "Sale",
  {
    sale_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sale_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    customer_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    sale_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "completed",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tax_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    grand_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "Sale",
    timestamps: true,
    indexes: [
      {
        name: "idx_sale_date",
        fields: ["sale_date"],
      },
      {
        name: "idx_sale_status",
        fields: ["status"],
      },
      {
        name: "idx_sale_created_by",
        fields: ["created_by"],
      },
    ],
  }
);

module.exports = Sale;
