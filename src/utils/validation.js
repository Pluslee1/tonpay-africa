export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^\+?\d{10,15}$/;
  return re.test(phone);
};

export const validateTONAddress = (address) => {
  return /^EQ[0-9a-zA-Z]{48}$/.test(address) || /^UQ[0-9a-zA-Z]{48}$/.test(address);
};

export const validateAmount = (amount, min = 0.01, max = null) => {
  const num = parseFloat(amount);
  if (isNaN(num) || num < min) return { valid: false, error: `Amount must be at least ${min}` };
  if (max !== null && num > max) return { valid: false, error: `Amount must be at most ${max}` };
  return { valid: true };
};

export const validateAccountNumber = (accountNumber) => {
  const cleaned = accountNumber.replace(/\s/g, '');
  return cleaned.length >= 10 && /^\d+$/.test(cleaned);
};

export const getFieldError = (field, value, rules = {}) => {
  if (rules.required && (!value || value.trim() === '')) {
    return `${field} is required`;
  }
  if (rules.email && value && !validateEmail(value)) {
    return 'Invalid email address';
  }
  if (rules.phone && value && !validatePhone(value)) {
    return 'Invalid phone number';
  }
  if (rules.minLength && value && value.length < rules.minLength) {
    return `${field} must be at least ${rules.minLength} characters`;
  }
  if (rules.maxLength && value && value.length > rules.maxLength) {
    return `${field} must be at most ${rules.maxLength} characters`;
  }
  return null;
};

export const validateForm = (formData, schema) => {
  const errors = {};
  Object.keys(schema).forEach(field => {
    const error = getFieldError(field, formData[field], schema[field]);
    if (error) errors[field] = error;
  });
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

