const express = require('express');
const { usersRouter } = require('./users');
const { projectsRouter } = require('./projects');
const { tasksRouter } = require('./tasks');
const { commentsRouter } = require('./comments');

const router = express.Router();

router.use('/users', usersRouter);
router.use('/projects', projectsRouter);
router.use('/tasks', tasksRouter);
router.use('/tasks/:id/comments', commentsRouter);

// Temporary: legacy router, shrinks as each resource gets its own route file.
router.use(require('../../routes'));

module.exports = router;
