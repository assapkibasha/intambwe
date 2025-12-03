const studentValidator = {
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidGender(gender) {
    if (!gender) return true;
    const valid = ['Male', 'Female', 'Other'];
    return valid.includes(gender);
  },

  validateStudentData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.std_fname !== undefined) {
      if (!data.std_fname || data.std_fname.trim().length === 0) {
        errors.push('First name is required');
      }
    }

    if (!isUpdate || data.std_lname !== undefined) {
      if (!data.std_lname || data.std_lname.trim().length === 0) {
        errors.push('Last name is required');
      }
    }

    if (data.std_email !== undefined) {
      if (data.std_email && !this.isValidEmail(data.std_email)) {
        errors.push('Invalid email format');
      }
    }

    if (data.std_gender !== undefined) {
      if (data.std_gender && !this.isValidGender(data.std_gender)) {
        errors.push('Invalid gender. Must be: Male, Female, or Other');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

module.exports = studentValidator;
