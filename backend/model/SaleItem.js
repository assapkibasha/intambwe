const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SaleItem = sequelize.define(
  "SaleItem",
  {
    sale_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Sale",
        key: "sale_id",
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
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    tax: {
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
    tableName: "SaleItem",
    timestamps: true,
    indexes: [
      {
        name: "idx_saleitem_sale",
        fields: ["sale_id"],
      },
      {
        name: "idx_saleitem_item",
        fields: ["item_id"],
      },
      {
        name: "idx_saleitem_sn",
        fields: ["sn_id"],
      },
    ],
    hooks: {
      beforeSave: (saleItem) => {
        const qty = Number(saleItem.quantity || 0);
        const unit = Number(saleItem.unit_price || 0);
        const discount = Number(saleItem.discount || 0);
        const tax = Number(saleItem.tax || 0);
        const total = qty * unit - discount + tax;
        saleItem.line_total = total < 0 ? 0 : total;
      },
    },
  }
);

module.exports = SaleItem;
