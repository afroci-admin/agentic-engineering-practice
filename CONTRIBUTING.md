# Contributing to Taskr

Taskr is a Node.js / Express 5 REST API backed by SQLite (`better-sqlite3`) and tested with Jest + supertest. This guide covers how to get running, how we write commits, and what must be true before a change is committed.

For architecture and layering rules, read [CLAUDE.md](CLAUDE.md) and the files in `.claude/context/`.

## 1. Set up the development environment

### Prerequisites

- **Node.js 18 or newer** (`npm run dev` uses `node --watch`). Check with `node -v`.
- **npm** (ships with Node).
- A C/C++ toolchain, because `better-sqlite3` compiles a native module on install (Xcode Command Line Tools on macOS, `build-essential` and Python on Debian/Ubuntu). `package.json` lists it under `allowScripts` so npm lets that build run.

### From a fresh clone

```bash
git clone <repo-url>
cd agentic-engineering-practice
```

```bash
npm install
```

```bash
npm run db:seed
```

```bash
npm run dev
```

- `npm run db:seed` creates `taskr.db` and loads sample data. Use `npm run db:reset` to drop it and re-seed.
- `npm run dev` starts the server on port 3000 and restarts on file changes. Open `http://localhost:3000/health` to confirm it's up. `npm start` runs it without watching.
- `taskr.db` (and its `-wal` / `-shm` files) is git-ignored. Never commit it.

You do not need to seed the database or start the server to run the tests (see below).

There is no linter or build step.

### Where code goes

```
routes/ → services/ → db/queries/ → db/connection.js
```

- Routes read the request, call one service function and send the response. No business logic in route handlers.
- Services hold business logic and throw errors built with `httpError`.
- All SQL lives in `src/db/queries/`. Nothing else calls `db.prepare`.
- Dependencies only point downward. No cycles.
- Files are kebab-case; resource files use the plural resource name in every layer (`routes/tasks.js`, `services/tasks.js`, `db/queries/tasks.js`).

## 2. Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description in the imperative mood

Optional body explaining what changed and why.
```

- **type**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, etc.
- **scope** (optional): the resource or area touched, e.g. `tasks`, `users`, `middleware`.
- **description**: imperative, lower case, no trailing period.
- Add a body when the change needs explaining.

Examples:

```
feat(tags): add endpoint to remove a tag from a task
fix(users): return 409 on duplicate email in PUT /users/:id
test(projects): cover 404 on unknown project id
docs: add CONTRIBUTING.md
```

The `/commit-push-pr` command (`.claude/commands/commit-push-pr.md`) writes messages in this format. Some older commits in the history predate the convention; follow it for new ones.

## 3. Run the test suite

```bash
npm test
```

Other useful forms:

```bash
npx jest tests/tasks.test.js
```

```bash
npx jest -t "<test name>"
```

```bash
npm run test:watch
```

Tests use an in-memory SQLite database (`NODE_ENV=test`), so they never touch `taskr.db` and need no seeding, running server, env vars or network. Test files live in `tests/<resource>.test.js`; Jest picks up `tests/*.test.js` automatically. Read `.claude/context/testing-standards.md` before adding or changing tests.

### What a passing run looks like

Every suite reports `PASS` and the summary ends with zero failures. At the time of writing:

```
Test Suites: 5 passed, 5 total
Tests:       54 passed, 54 total
Snapshots:   0 total
```

The test counts will grow as tests are added. What matters is that nothing is reported as failed and the command exits with status 0.

**Expect noisy output.** Many tests deliberately trigger errors (404, 409, and so on), and the error handler logs each one with `console.error`, so a passing run prints a lot of `console.error` stack traces such as `Error: Task not found`. These are expected. Judge the run by the `PASS`/`FAIL` lines and the summary, not by the stack traces.

## 4. Verify before you commit: `/verify-app`

`/verify-app` (defined in `.claude/commands/verify-app.md`) runs the full verification suite. It runs `npm test -- --runInBand` (serial), and if anything fails it fixes the implementation, not the tests, and reruns until the suite passes. It then reports either all tests passing or the specific failures that remain.

**Run it after any significant change, before committing.** A significant change means anything beyond a typo or a comment: new or changed routes, services, queries, middleware, schema, or tests.

The suite exercises every API endpoint through supertest, so a green run means the application works end to end. The exceptions are the behaviors listed under "Known gaps" in CLAUDE.md (for example `PUT /users/:id` not validating email), which the tests don't cover.

If you aren't using Claude Code, run `npm test -- --runInBand` yourself and apply the same standard.

## 5. Never commit with failing tests

**Do not commit if any test is failing.** No exceptions:

- Fix the code, not the test. Only change a test when the intended behavior has really changed.
- Don't skip, delete or comment out failing tests to get a green run.
- Don't commit work in progress that breaks the suite. Finish the change, or stash it.

## Known gaps

CLAUDE.md lists known gaps the refactor deliberately left alone (missing validation on some `PUT` endpoints, missing auth on `DELETE /tasks/:id` and the tag endpoints, placeholder `auth.js` and `sendEmail`). If your task touches one of these areas, mention it in your PR; don't fix it unprompted. Don't build on the placeholders.
