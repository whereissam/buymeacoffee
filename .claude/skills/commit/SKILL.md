---
name: commit
description: Stage relevant files and create a conventional commit
disable-model-invocation: true
---

Stage and commit the current changes:

1. Run `git status` and `git diff` to understand all changes
2. Only `git add` files related to the current task — never `git add -A` or `git add .`
3. Group related files into one commit when they share the same context (e.g. all bug fixes = one fix commit, not one per file)
4. Only split into multiple commits when changes are truly unrelated (e.g. a feat + a docs update)
5. Write a single-line conventional commit message: `type(scope): description`
   - Types: feat, fix, docs, style, refactor, perf, test, chore
   - Keep it concise, under 72 characters
6. Run `git commit -m "message"`
7. Show the result
