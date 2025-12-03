const timetableEntryValidator = {
  validateEntryData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.timetable_id !== undefined || data.class_id !== undefined || data.day_of_week !== undefined || data.start_time !== undefined || data.end_time !== undefined) {
      if (!data.timetable_id || !data.class_id || !data.day_of_week || !data.start_time || !data.end_time) {
        errors.push('timetable_id, class_id, day_of_week, start_time and end_time are required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

module.exports = timetableEntryValidator;
