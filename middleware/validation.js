const { body, validationResult } = require('express-validator');

// Validation middleware factory
const getValidationMiddleware = (type) => {
  let validations = [];

  switch (type) {
    case 'register':
      validations = [
        body('email')
          .isEmail()
          .withMessage('Please provide a valid email address')
          .normalizeEmail(),
        body('password')
          .isLength({ min: 6 })
          .withMessage('Password must be at least 6 characters long'),
        body('userType')
          .isIn(['traveler', 'service_provider'])
          .withMessage('User type must be either traveler or service_provider'),
        body('fullName')
          .optional()
          .trim()
          .isLength({ min: 2 })
          .withMessage('Full name must be at least 2 characters long'),
        body('businessName')
          .if(body('userType').equals('service_provider'))
          .notEmpty()
          .withMessage('Business name is required for service providers'),
        body('dateOfBirth')
          .if(body('userType').equals('traveler'))
          .notEmpty()
          .withMessage('Date of birth is required for travelers')
          .isISO8601()
          .withMessage('Please provide a valid date of birth')
          .custom((value) => {
            const birthDate = new Date(value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            if (age < 18) {
              throw new Error('You must be at least 18 years old to register');
            }
            return true;
          })
      ];
      break;

    case 'login':
      validations = [
        body('email')
          .isEmail()
          .withMessage('Please provide a valid email address')
          .normalizeEmail(),
        body('password')
          .notEmpty()
          .withMessage('Password is required')
      ];
      break;

    default:
      validations = [];
  }

  // Return middleware array with validation rules and error handler
  return [
    ...validations,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array().map(err => ({
            field: err.path,
            message: err.msg
          }))
        });
      }
      next();
    }
  ];
};

module.exports = { getValidationMiddleware };
