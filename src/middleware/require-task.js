const tasksService = require('../services/tasks');

// Runs before body validation so an unknown task id is reported as 404 first.
function requireTask(req, res, next) {
  try {
    tasksService.assertTaskExists(parseInt(req.params.id));
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireTask };
