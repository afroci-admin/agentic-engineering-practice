const express = require('express');
const { usersRouter } = require('./users');

const router = express.Router();

router.use('/users', usersRouter);

// Temporary: legacy router, shrinks as each resource gets its own route file.
router.use(require('../../routes'));

module.exports = router;
