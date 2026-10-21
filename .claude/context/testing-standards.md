# Testing standards: writing tests for the Taskr API

Follow these rules whenever you add or change tests.

## 1. File naming

- Name test files `resource.test.js`, in lowercase: `tasks.test.js`, `projects.test.js`, `users.test.js`.
- Put them in `tests/`. Jest picks up `tests/*.test.js` automatically, so no config change is needed.

## 2. Jest + supertest against an in-memory database

- Use Jest as the runner and supertest to call the Express app (`request(app).get('/tasks')`). Import `app` from `src/app.js`; it doesn't start a server when imported (only `src/server.js` calls `listen`).
- Set `process.env.NODE_ENV = 'test'` **before** requiring the app, so `src/db/connection.js` opens SQLite with `:memory:`. Tests must never touch `taskr.db`.
- Create the tables with `createSchema(db)` from `src/db/schema.js` in `beforeAll`.
- Reset the data in `beforeEach` so tests don't depend on each other or on run order.
- Don't mock the database. Use the real in-memory one.

```js
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const { db } = require('../src/db/connection');
const { createSchema } = require('../src/db/schema');

beforeAll(() => {
  createSchema(db);
});

beforeEach(() => {
  db.exec('DELETE FROM task_tags; DELETE FROM comments; DELETE FROM tasks; DELETE FROM projects; DELETE FROM users; DELETE FROM tags;');
});
```

## 3. Coverage per endpoint

For every endpoint a test file covers, write:

- the **happy path** (correct status code and response body), and
- **at least two error cases**, such as a missing required field, an invalid value, a nonexistent id (404), a duplicate (409), or a missing/wrong API key (401) on protected routes.

## 4. Test descriptions

Describe what the endpoint does in plain English, not how it is implemented.

- Good: `returns only active tasks when filtered by status`, `rejects a task without a title`
- Avoid: `calls getTasks with status param`, `db.prepare is invoked once`

Group tests with `describe('<METHOD> <path>')`, as in the existing `describe('GET /tasks')`.

## 5. Runnable with `npm test` alone

- The suite must pass with `npm install` followed by `npm test`. No seeding, no running server, no environment variables, no external services.
- Don't add tests that need `taskr.db`, network access, or a prior `npm run db:seed`.
- If a schema change is needed, update `src/db/schema.js`; the tests and `src/db/seed.js` both use it.

## Checklist

- [ ] File is `tests/<resource>.test.js` (lowercase)
- [ ] `NODE_ENV = 'test'` set before requiring the app; schema created via `createSchema`
- [ ] Data reset in `beforeEach`
- [ ] Each endpoint has a happy-path test and at least two error-case tests
- [ ] Descriptions say what the endpoint does, in plain English
- [ ] `npm test` passes with no other setup
