const tagsQueries = require('../db/queries/tags');
const tasksService = require('./tasks');
const { httpError, isUniqueViolation } = require('../utils/errors');

function listTags() {
  return tagsQueries.findAll();
}

function createTag({ name }) {
  try {
    return tagsQueries.insert(name.toLowerCase().trim());
  } catch (err) {
    if (isUniqueViolation(err)) throw httpError(409, 'tag already exists');
    throw err;
  }
}

function attachTag(taskId, { tag_id }) {
  tasksService.assertTaskExists(taskId);
  const tagId = parseInt(tag_id);
  if (!tagsQueries.findById(tagId)) throw httpError(404, 'Tag not found');

  try {
    tagsQueries.attachToTask(taskId, tagId);
  } catch (err) {
    if (isUniqueViolation(err)) throw httpError(409, 'tag already applied to this task');
    throw err;
  }
  return { task_id: taskId, tag_id: tagId };
}

function detachTag(taskId, tagId) {
  if (tagsQueries.detachFromTask(taskId, tagId) === 0) {
    throw httpError(404, 'Tag not applied to this task');
  }
  return { deleted: true };
}

module.exports = { listTags, createTag, attachTag, detachTag };
