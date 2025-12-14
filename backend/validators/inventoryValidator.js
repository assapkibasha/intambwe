const inventoryValidator = {
  validateInventoryData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.item_name !== undefined) {
      if (!data.item_name) errors.push("Item name is required");
    }

    if (!isUpdate || data.item_code !== undefined) {
      if (!data.item_code) errors.push("Item code is required");
    }

    if (!isUpdate || data.item_sku !== undefined) {
      if (!data.item_sku) errors.push("Item SKU is required");
    }

    if (!isUpdate || data.quantity !== undefined) {
      if (!Number.isInteger(data.quantity) || data.quantity < 0) {
        errors.push("Quantity must be a non-negative integer");
      }
    }

    if (data.min_stock_level !== undefined && data.min_stock_level < 0) {
      errors.push("Minimum stock level cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

module.exports = inventoryValidator;
