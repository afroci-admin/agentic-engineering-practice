const express = require('express');
const router = require('./routes');
const { requestLogger } = require('./middleware/request-logger');
const { errorHandler } = require('./middleware/error-handler');

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use(router);
app.use(errorHandler);

module.exports = app;
