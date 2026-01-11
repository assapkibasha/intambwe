const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const StockOutItem = sequelize.define(
  "StockOutItem",
  {
    stock_out_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    stock_outId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "StockOut",
        key: "stock_outId",
      },
    },
    item_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "Product",
        key: "item_id",
      },
    },
    sn_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
  },
  {
    tableName: "StockOutItem",
    timestamps: true,
    indexes: [
      {
        name: "idx_stockoutitem_out",
        fields: ["stock_outId"],
      },
      {
        name: "idx_stockoutitem_item",
        fields: ["item_id"],
      },
      {
        name: "idx_stockoutitem_sn",
        fields: ["sn_id"],
      },
    ],
  }
);

module.exports = StockOutItem;
