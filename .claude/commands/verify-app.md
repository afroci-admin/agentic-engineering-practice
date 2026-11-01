---
description: Run the full verification suite after a significant change
allowed-tools: Bash(npm test:*), Bash(npx jest:*)
---

Run the full verification suite for this project.

1. Run `npm test -- --runInBand` to run the full test suite serially. The suite uses supertest and exercises all API endpoints directly, so if the tests pass, the server and all endpoints are working correctly.
2. If any tests fail, fix the implementation (not the tests) and run `npm test -- --runInBand` again. Repeat until all tests pass.
3. Report the result clearly: either all tests passing and all endpoints verified, or the specific failures that still need addressing.
