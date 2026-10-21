---
description: Commit staged changes, push the current branch, and open a pull request
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git commit:*), Bash(git branch:*), Bash(git push origin:*), Bash(gh pr create:*)
---

Commit all staged changes, push them to the current branch, and open a pull request.

1. Run `git status` to show what will be committed. If nothing is staged, stop and tell me.
2. Run `git diff --staged` to review the staged changes.
3. Write a commit message in conventional commits format (`type(scope): description`) based on what was staged. Use a body when the change needs explaining.
4. Run `git commit -m "<message>"` with that message.
5. Get the current branch name with `git branch --show-current`, then run `git push origin <branch>`. If the current branch is `main`, stop and ask me before pushing.
6. Run `gh pr create --fill` to open a pull request using the commit message as the PR body.

Report the commit hash and the PR URL when done.
