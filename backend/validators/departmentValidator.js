const departmentValidator = {
  validateDepartmentData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.dpt_name !== undefined) {
      if (!data.dpt_name || data.dpt_name.trim().length === 0) {
        errors.push('dpt_name is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

module.exports = departmentValidator;
