const express = require('express');
const commentsService = require('../services/comments');
const { requireTask } = require('../middleware/require-task');
const { validateCreateComment } = require('../middleware/validate-comment');

// Mounted at /tasks/:id/comments
const commentsRouter = express.Router({ mergeParams: true });

commentsRouter.get('/', (req, res, next) => {
  try {
    res.json(commentsService.listComments(parseInt(req.params.id)));
  } catch (err) {
    next(err);
  }
});

commentsRouter.post('/', requireTask, validateCreateComment, (req, res, next) => {
  try {
    res.status(201).json(commentsService.createComment(parseInt(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
});

module.exports = { commentsRouter };
