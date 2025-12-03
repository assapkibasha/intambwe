const subjectValidator = {
  validateSubjectData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.sbj_name !== undefined) {
      if (!data.sbj_name || data.sbj_name.trim().length === 0) {
        errors.push('sbj_name is required');
      }
    }

    if (!isUpdate || data.sbj_code !== undefined) {
      if (!data.sbj_code || data.sbj_code.trim().length === 0) {
        errors.push('sbj_code is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

module.exports = subjectValidator;
