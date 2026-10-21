const { isNonEmptyString } = require('../utils/validation');

function validateCreateTag(req, res, next) {
  const { name } = req.body;
  if (!name || !isNonEmptyString(name)) {
    return next({ status: 400, message: 'name is required' });
  }
  next();
}

function validateAttachTag(req, res, next) {
  if (!req.body.tag_id) {
    return next({ status: 400, message: 'tag_id is required' });
  }
  next();
}

module.exports = { validateCreateTag, validateAttachTag };
