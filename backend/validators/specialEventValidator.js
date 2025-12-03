const specialEventValidator = {
  validateEventData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.title !== undefined || data.event_date !== undefined || data.start_time !== undefined || data.end_time !== undefined) {
      if (!data.title || !data.event_date || !data.start_time || !data.end_time) {
        errors.push('title, event_date, start_time and end_time are required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

module.exports = specialEventValidator;
