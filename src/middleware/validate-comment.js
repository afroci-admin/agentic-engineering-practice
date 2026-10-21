const { isNonEmptyString } = require('../utils/validation');

function validateCreateComment(req, res, next) {
  const { user_id, body } = req.body;
  if (!body || !isNonEmptyString(body)) {
    return next({ status: 400, message: 'body is required' });
  }
  if (!user_id) {
    return next({ status: 400, message: 'user_id is required' });
  }
  next();
}

module.exports = { validateCreateComment };
