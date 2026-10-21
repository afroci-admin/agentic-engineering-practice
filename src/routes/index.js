const express = require('express');
const { usersRouter } = require('./users');
const { projectsRouter } = require('./projects');

const router = express.Router();

router.use('/users', usersRouter);
router.use('/projects', projectsRouter);

// Temporary: legacy router, shrinks as each resource gets its own route file.
router.use(require('../../routes'));

module.exports = router;
