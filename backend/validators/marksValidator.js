const marksValidator = {
  validateMarksData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.std_id !== undefined || data.sbj_id !== undefined) {
      if (!data.std_id || !data.sbj_id) {
        errors.push('std_id and sbj_id are required');
      }
    }

    if (data.score !== undefined) {
      if (typeof data.score !== 'number') {
        errors.push('score must be a number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

module.exports = marksValidator;
