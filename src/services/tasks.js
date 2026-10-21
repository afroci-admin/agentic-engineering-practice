const tasksQueries = require('../db/queries/tasks');
const projectsQueries = require('../db/queries/projects');
const usersQueries = require('../db/queries/users');
const tagsQueries = require('../db/queries/tags');
const commentsQueries = require('../db/queries/comments');
const { httpError } = require('../utils/errors');

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

function listTasks({ status, project_id, assignee_id, page, page_size }) {
  const limit = Math.min(MAX_PAGE_SIZE, parseInt(page_size) || DEFAULT_PAGE_SIZE);
  const offset = ((parseInt(page) || 1) - 1) * limit;

  return tasksQueries.findAll({
    status: status || undefined,
    projectId: project_id ? parseInt(project_id) : undefined,
    assigneeId: assignee_id ? parseInt(assignee_id) : undefined,
    limit,
    offset
  });
}

function assertTaskExists(id) {
  const task = tasksQueries.findById(id);
  if (!task) throw httpError(404, 'Task not found');
  return task;
}

function getTask(id) {
  const task = assertTaskExists(id);
  task.tags = tagsQueries.findByTaskId(id);
  task.comments = commentsQueries.findByTaskId(id);
  return task;
}

function createTask({ title, description, project_id, assignee_id, due_date }) {
  if (project_id && !projectsQueries.findById(parseInt(project_id))) {
    throw httpError(400, 'project not found');
  }
  if (assignee_id && !usersQueries.findById(parseInt(assignee_id))) {
    throw httpError(400, 'assignee not found');
  }
  return tasksQueries.insert({
    title,
    description: description || null,
    projectId: project_id ? parseInt(project_id) : null,
    assigneeId: assignee_id ? parseInt(assignee_id) : null,
    dueDate: due_date || null
  });
}

function updateTask(id, data) {
  const existing = assertTaskExists(id);

  const status = data.status !== undefined ? data.status : existing.status;
  const completedAt = status === 'completed' && existing.status !== 'completed'
    ? new Date().toISOString()
    : (status !== 'completed' ? null : existing.completed_at);

  return tasksQueries.update(id, {
    title: data.title !== undefined ? data.title : existing.title,
    description: data.description !== undefined ? data.description : existing.description,
    status,
    projectId: data.project_id !== undefined ? data.project_id : existing.project_id,
    assigneeId: data.assignee_id !== undefined ? data.assignee_id : existing.assignee_id,
    dueDate: data.due_date !== undefined ? data.due_date : existing.due_date,
    completedAt
  });
}

function deleteTask(id) {
  if (tasksQueries.remove(id) === 0) throw httpError(404, 'Task not found');
  return { deleted: true };
}

module.exports = { listTasks, assertTaskExists, getTask, createTask, updateTask, deleteTask };
