const { isNonEmptyString } = require('../utils/validation');

function validateCreateProject(req, res, next) {
  const { name } = req.body;
  if (!name || !isNonEmptyString(name)) {
    return next({ status: 400, message: 'name is required' });
  }
  next();
}

module.exports = { validateCreateProject };
