const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReturnItem = sequelize.define(
  "ReturnItem",
  {
    return_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    return_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "SaleReturn",
        key: "return_id",
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
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    line_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: "ReturnItem",
    timestamps: true,
    indexes: [
      {
        name: "idx_returnitem_return",
        fields: ["return_id"],
      },
      {
        name: "idx_returnitem_item",
        fields: ["item_id"],
      },
      {
        name: "idx_returnitem_sn",
        fields: ["sn_id"],
      },
    ],
    hooks: {
      beforeSave: (returnItem) => {
        const qty = Number(returnItem.quantity || 0);
        const unit = Number(returnItem.unit_price || 0);
        const total = qty * unit;
        returnItem.line_total = total < 0 ? 0 : total;
      },
    },
  }
);

module.exports = ReturnItem;
