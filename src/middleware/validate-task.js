const { isNonEmptyString } = require('../utils/validation');
const { VALID_TASK_STATUSES } = require('../utils/constants');

const STATUS_MESSAGE = `status must be one of: ${VALID_TASK_STATUSES.join(', ')}`;

function validateListTasksQuery(req, res, next) {
  const { status } = req.query;
  if (status && !VALID_TASK_STATUSES.includes(status)) {
    return next({ status: 400, message: STATUS_MESSAGE });
  }
  next();
}

function validateCreateTask(req, res, next) {
  const { title } = req.body;
  if (!title || !isNonEmptyString(title)) {
    return next({ status: 400, message: 'title is required' });
  }
  next();
}

function validateUpdateTask(req, res, next) {
  const { status } = req.body;
  if (status && !VALID_TASK_STATUSES.includes(status)) {
    return next({ status: 400, message: STATUS_MESSAGE });
  }
  next();
}

module.exports = { validateListTasksQuery, validateCreateTask, validateUpdateTask };
