const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Inventory = sequelize.define(
  "Inventory",
  {
    inventory_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    item_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    item_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    item_sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    status: {
      type: DataTypes.ENUM("OKAY", "DAMAGED", "LOST"),
      defaultValue: "OKAY",
    },

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories",
        key: "category_id",
      },
    },

    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "suppliers",
        key: "supplier_id",
      },
    },

    warehouse_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "warehouses",
        key: "warehouse_id",
      },
    },

    unit: {
      type: DataTypes.ENUM("pieces", "boxes", "kg", "liters"),
      defaultValue: "pieces",
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    min_stock_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "inventory",
    timestamps: false,
  }
);

module.exports = Inventory;
