const categoryValidator = {
  validateCategoryData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.category_name !== undefined) {
      if (!data.category_name || data.category_name.trim().length === 0) {
        errors.push("Category name is required");
      } else if (data.category_name.length > 100) {
        errors.push("Category name must not exceed 100 characters");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

module.exports = categoryValidator;
