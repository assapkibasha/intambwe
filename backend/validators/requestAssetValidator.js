const requestAssetValidator = {
  validateRequestData(data) {
    const errors = [];

    if (!data.inventory_id || isNaN(data.inventory_id)) {
      errors.push("Valid inventory ID is required");
    }

    if (
      !data.requested_quantity ||
      !Number.isInteger(data.requested_quantity) ||
      data.requested_quantity <= 0
    ) {
      errors.push("Requested quantity must be greater than zero");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

module.exports = requestAssetValidator;
