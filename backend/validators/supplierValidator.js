const supplierValidator = {
  validateSupplierData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.supplier_name !== undefined) {
      if (!data.supplier_name || data.supplier_name.trim().length === 0) {
        errors.push("Supplier name is required");
      }
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Invalid supplier email format");
    }

    if (data.phone && data.phone.length > 20) {
      errors.push("Phone number too long");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

module.exports = supplierValidator;
