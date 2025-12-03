const attendanceValidator = {
  validateAttendanceData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.student_id !== undefined || data.class_id !== undefined || data.date !== undefined) {
      if (!data.student_id || !data.class_id || !data.date) {
        errors.push('student_id, class_id and date are required');
      }
    }

    if (data.status !== undefined) {
      const validStatuses = ['PRESENT', 'ABSENT', 'LATE'];
      if (data.status && !validStatuses.includes(data.status)) {
        errors.push('Invalid status. Must be PRESENT, ABSENT or LATE');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

module.exports = attendanceValidator;
