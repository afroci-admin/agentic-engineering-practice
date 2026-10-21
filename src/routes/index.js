const express = require('express');
const { systemRouter } = require('./system');
const { webhooksRouter } = require('./webhooks');
const { usersRouter } = require('./users');
const { projectsRouter } = require('./projects');
const { tasksRouter } = require('./tasks');
const { commentsRouter } = require('./comments');
const { tagsRouter, taskTagsRouter } = require('./tags');

const router = express.Router();

router.use(systemRouter);
router.use('/webhooks', webhooksRouter);
router.use('/users', usersRouter);
router.use('/projects', projectsRouter);
router.use('/tasks', tasksRouter);
router.use('/tasks/:id/comments', commentsRouter);
router.use('/tasks/:id/tags', taskTagsRouter);
router.use('/tags', tagsRouter);

module.exports = router;
