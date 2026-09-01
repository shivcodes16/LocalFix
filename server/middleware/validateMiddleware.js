const { validationResult } = require('express-validator');

// Runs after an array of express-validator checks; short-circuits with a 400
// containing all field errors if any check failed.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const message = errors
      .array()
      .map((e) => `${e.path}: ${e.msg}`)
      .join('; ');
    return next(new Error(message));
  }
  next();
};

module.exports = validate;
