const express = require('express');
const tasksService = require('../services/tasks');
const { requireTask } = require('../middleware/require-task');
const {
  validateListTasksQuery,
  validateCreateTask,
  validateUpdateTask
} = require('../middleware/validate-task');

const tasksRouter = express.Router();

tasksRouter.get('/', validateListTasksQuery, (req, res, next) => {
  try {
    res.json(tasksService.listTasks(req.query));
  } catch (err) {
    next(err);
  }
});

tasksRouter.post('/', validateCreateTask, (req, res, next) => {
  try {
    res.status(201).json(tasksService.createTask(req.body));
  } catch (err) {
    next(err);
  }
});

tasksRouter.get('/:id', (req, res, next) => {
  try {
    res.json(tasksService.getTask(parseInt(req.params.id)));
  } catch (err) {
    next(err);
  }
});

tasksRouter.put('/:id', requireTask, validateUpdateTask, (req, res, next) => {
  try {
    res.json(tasksService.updateTask(parseInt(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
});

tasksRouter.delete('/:id', (req, res, next) => {
  try {
    res.json(tasksService.deleteTask(parseInt(req.params.id)));
  } catch (err) {
    next(err);
  }
});

module.exports = { tasksRouter };
