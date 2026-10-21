# API conventions: adding a new endpoint

Follow these steps whenever you add an endpoint to the Taskr API. Routes call services, services call queries; see CLAUDE.md for the layering rules.

## 1. Put the route in the resource's route file

- Routes live in `src/routes/`, one file per resource.
- The file name is the resource name in lowercase plural, in kebab-case: `tasks.js`, `projects.js`, `comments.js`, `tags.js`.
- If the resource already has a file, add the endpoint there. Otherwise create it.

## 2. Export a named Express router

Each route file creates an `express.Router()` and exports it by name:

```js
const express = require('express');
const tasksService = require('../services/tasks');

const tasksRouter = express.Router();

// handlers go here

module.exports = { tasksRouter };
```

Name the router `<resource>Router`. A router for paths nested under another resource (like `/tasks/:id/comments`) uses `express.Router({ mergeParams: true })` so it can read `req.params.id`.

## 3. Handlers call a service, nothing more

- A route handler only reads the request, calls one corresponding function in `src/services/`, and sends the response.
- Business logic and database access go in the service and `src/db/queries/`, not in the handler. A service never writes SQL; it calls a function in `src/db/queries/<resource>.js`.
- Input-shape validation goes in a `validate-<resource>.js` middleware in `src/middleware/`, listed before the handler in the route.
- The service file is named after the resource, like the route file (`src/services/tasks.js`). Add the function there, named for what it does (`createTask`, `listTasks`).

```js
tasksRouter.post('/', validateCreateTask, (req, res, next) => {
  try {
    res.status(201).json(tasksService.createTask(req.body));
  } catch (err) {
    next(err);
  }
});
```

## 4. Pass errors to `next`

- Never send error responses from a handler or middleware with `res.status(...).json(...)`.
- Pass the error to Express's `next` function as an object with a status code and a message:

```js
next({ status: 400, message: 'title is required' });
```

- Services signal failures by throwing `httpError(status, message)` from `src/utils/errors.js`. The handler's `catch` passes it to `next`, as in the example above.
- The shared `errorHandler` in `src/middleware/error-handler.js` turns this into the JSON response (`{ error: message }` with the status code).

## 5. Register the router in `src/routes/index.js`

Import the router and mount it with `router.use`, using the resource path:

```js
const { tasksRouter } = require('./tasks');

router.use('/tasks', tasksRouter);
```

An endpoint that isn't registered in `src/routes/index.js` is unreachable. `src/app.js` mounts `routes/index.js` before the `errorHandler`, so you don't touch `app.js`.

## Checklist

- [ ] Route is in `src/routes/<resource>.js` (lowercase plural, kebab-case)
- [ ] File exports a named router (`{ <resource>Router }`)
- [ ] Handler calls a function in `src/services/` and contains no business logic
- [ ] SQL is in `src/db/queries/<resource>.js`, input checks in `src/middleware/validate-<resource>.js`
- [ ] Errors go through `next({ status, message })` or a thrown `httpError`
- [ ] Router is registered in `src/routes/index.js` with `router.use('/<resource>', <resource>Router)`
- [ ] Tests added in `tests/<resource>.test.js`
