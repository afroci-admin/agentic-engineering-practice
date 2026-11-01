# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run db:seed` — create `taskr.db` and seed sample data; `npm run db:reset` drops and re-seeds
- `npm run dev` — start with `node --watch` on port 3000 (`/health` to confirm); `npm start` without watching
- `npm test` — Jest + supertest; one file: `npx jest tests/tasks.test.js`; one test: `npx jest -t "<test name>"`
- No linter or build step is configured.
- `better-sqlite3` compiles a native module on install; `package.json` lists it under `allowScripts` so npm lets that build run.

## Folder structure

Express 5 + better-sqlite3 (synchronous API), CommonJS, layered under `src/`.

```
src/
  app.js, server.js     app setup (exported for tests) and the listener
  routes/               one router per resource, mounted in routes/index.js
  services/             business logic and errors
  db/
    connection.js       the database connection
    schema.js, seed.js  schema (shared with tests) and sample data
    queries/            all SQL, one file per resource
  middleware/           auth, error handler, request logger, validators
  utils/                constants, validation helpers, error helpers
tests/                  <resource>.test.js
```

Routes call services, services call queries, and queries call the database connection. Dependencies flow one way: `routes/` → `services/` → `db/queries/` → `db/connection.js`.

## Naming conventions

- All files use kebab-case (`error-handler.js`, `validate-task.js`, `request-logger.js`).
- Resource files are the lowercase plural resource name, with the same name in each layer (`routes/tasks.js`, `services/tasks.js`, `db/queries/tasks.js`).
- Test files are `<resource>.test.js` in `tests/`.

## Architecture

- `src/app.js` builds the app (JSON parsing, `requestLogger`, `routes/index.js`, `errorHandler`) and exports it. `src/server.js` is the only place that calls `listen`, so tests import `app` without starting a server.
- `src/routes/` — one Express router per resource (`users`, `projects`, `tasks`, `comments`, `tags`, plus `system` for `/` and `/health`, and `webhooks`). `routes/index.js` mounts them all. Handlers read the request, call one service function, and send the response; errors go to `next(err)`.
- `src/services/` — business logic and errors. Services throw errors with `status` and `message` (built with `httpError` in `utils/errors.js`). `notifications.js` holds the welcome email and the `sendEmail` stub.
- `src/db/queries/` — every SQL statement lives here, one file per resource. Nothing outside this directory calls `db.prepare`.
- `src/db/connection.js` opens the connection: `:memory:` when `NODE_ENV=test`, otherwise `DB_PATH` or `taskr.db`; WAL and foreign keys on. `src/db/schema.js` exports `createSchema(db)`, used by `src/db/seed.js` and by the tests.
- `src/middleware/` — `auth.js` (placeholder `x-api-key` check, `API_KEY` env, default `dev-key`, applied only to `DELETE /users/:id` and `DELETE /projects/:id`), `error-handler.js`, `request-logger.js`, `require-task.js` (404 for an unknown `:id` before body validation) and one `validate-<resource>.js` per resource.
- `src/utils/` — `constants.js` (`PORT`, `VALID_TASK_STATUSES`), `validation.js` (`validateEmail`, `isNonEmptyString`) and `errors.js` (`httpError`, `isUniqueViolation`).
- Task statuses are defined in `utils/constants.js` (`VALID_TASK_STATUSES`) and again in the SQL `CHECK` constraint in `db/schema.js`. `PUT /tasks/:id` sets `completed_at` itself on status transitions (in `services/tasks.js`).

## Known gaps (not fixed by the refactor)

The refactor kept HTTP behavior identical. These gaps remain; mention them when your task touches the area, and don't fix them unprompted:

- `PUT /users/:id` does not validate the email and returns 500 on a duplicate email.
- `PUT /projects/:id` has no name validation; `PUT /tasks/:id` does not validate the title or foreign-key ids.
- `DELETE /tasks/:id` and the tag endpoints have no auth.
- `auth.js` (needs real JWT validation) and the `sendEmail` stub in `services/notifications.js` (needs a real provider) are placeholders. Don't build on them.
- The `status` list is duplicated between `utils/constants.js`, the SQL `CHECK` constraint, and the stats keys in `services/projects.js`.

## Never do these things

- Never put SQL outside `src/db/queries/`, and never put business logic in route handlers.
- Never add route logic for a resource to another resource's route file; create or extend the file for that resource.
- Never add a dependency that points upward (a service requiring a route, a query requiring a service) or creates a cycle.
- Never add a helper to `utils/` without first checking whether it belongs in a more specific module.

## Testing gotchas

- Test files set `process.env.NODE_ENV = 'test'` before requiring `../src/app`, so `src/db/connection.js` uses the in-memory database, then call `createSchema(db)` from `src/db/schema.js`. The seed script uses the same function, so a schema change is made in one place.
- Name test files `resource.test.js` (e.g. `tasks.test.js`) in `tests/`. Jest's `testMatch` is the glob `**/tests/*.test.js`, so new files are picked up automatically.

## Verification

After completing any significant change, run `/verify-app` before committing. Do not commit if any tests are failing.

The test suite uses supertest and covers all API endpoints, so a passing run confirms the full application is working correctly. The exceptions are the behaviors listed under "Known gaps", which the tests don't exercise.

## Context Files

Read the relevant file before starting the task:

- `.claude/context/api-conventions.md` — for any task involving API routes or endpoints
- `.claude/context/testing-standards.md` — for any task involving tests or test coverage
