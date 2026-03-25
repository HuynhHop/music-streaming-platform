const AppError = require('../utils/AppError');

const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
    }
    next();
  };
};

const validateEmail = (req, res, next) => {
  const { email } = req.body;
  if (email) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return next(new AppError('Invalid email format', 400));
    }
  }
  next();
};

const validatePhone = (req, res, next) => {
  const { phone } = req.body;
  if (phone && (!/^\d{10}$/.test(phone) || isNaN(phone))) {
    return next(new AppError('Phone number must be 10 digits', 400));
  }
  next();
};

module.exports = {
  validateRequiredFields,
  validateEmail,
  validatePhone
};