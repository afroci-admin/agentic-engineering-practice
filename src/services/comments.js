const commentsQueries = require('../db/queries/comments');
const usersQueries = require('../db/queries/users');
const tasksService = require('./tasks');
const { httpError } = require('../utils/errors');

function listComments(taskId) {
  tasksService.assertTaskExists(taskId);
  return commentsQueries.findByTaskId(taskId);
}

function createComment(taskId, { user_id, body }) {
  tasksService.assertTaskExists(taskId);
  const userId = parseInt(user_id);
  if (!usersQueries.findById(userId)) throw httpError(400, 'user not found');
  return commentsQueries.insert(taskId, userId, body);
}

module.exports = { listComments, createComment };
