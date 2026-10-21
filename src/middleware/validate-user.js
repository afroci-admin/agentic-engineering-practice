const { isNonEmptyString } = require('../utils/validation');

function validateCreateUser(req, res, next) {
  const { name, email } = req.body;
  if (!name || !isNonEmptyString(name)) {
    return next({ status: 400, message: 'name is required' });
  }
  if (!email || !isNonEmptyString(email)) {
    return next({ status: 400, message: 'email is required' });
  }
  next();
}

module.exports = { validateCreateUser };
