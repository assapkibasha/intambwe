const warehouseValidator = {
  validateWarehouseData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.warehouse_name !== undefined) {
      if (!data.warehouse_name || data.warehouse_name.trim().length === 0) {
        errors.push("Warehouse name is required");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

module.exports = warehouseValidator;
