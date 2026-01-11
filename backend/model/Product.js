const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define(
  "Product",
  {
    item_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING(80),
      allowNull: true,
      unique: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Category",
        key: "category_id",
      },
    },
    track_serial: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    default_unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "Product",
    timestamps: true,
    indexes: [
      {
        name: "idx_product_category",
        fields: ["category_id"],
      },
      {
        name: "idx_product_active",
        fields: ["active"],
      },
    ],
  }
);

module.exports = Product;
