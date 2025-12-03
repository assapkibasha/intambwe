const timetableValidator = {
  validateTimetableData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.timetable_name !== undefined) {
      if (!data.timetable_name || data.timetable_name.trim().length === 0) {
        errors.push('timetable_name is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

module.exports = timetableValidator;
