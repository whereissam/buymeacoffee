---
name: implement
description: Implement a plan end-to-end with automatic test fixing
---

Implement the provided plan end-to-end. Do NOT stop or ask for help until all tests pass.

1. Read the implementation plan from the referenced file or message
2. Implement all changes across backend, frontend, and contracts
3. Run build (`bun run build` for TS, `swift build` for iOS, `forge build` for Solidity)
4. Fix any build errors before continuing
5. After each major change, run the full test suite:
   - TypeScript: `bun test`
   - iOS: `swift test`
   - Python: `pytest`
   - Solidity: `forge test`
6. If any test fails, diagnose the root cause, fix it, and re-run — keep going until green
7. Update TODO.md marking completed items with [x] and add any new items discovered
8. Verify TODO.md was actually written to disk
9. Stage ONLY the files related to this feature — never `git add .` or `git add -A`
10. Generate a conventional commit message summarizing changes
