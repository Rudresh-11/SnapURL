
# WARP Project Rules



This file defines project-scoped rules for Warp agents operating in this repository.

All agents MUST follow these rules unless explicitly overridden.



Priority:

- A subdirectory `WARP.md` overrides this root file.

- If rules conflict, the closest file in the directory tree wins.



---



## Scope

- Applies to: Entire repository by default

- Allowed scope expansion: ONLY when explicitly requested

- Forbidden by default:

  - Full-repo scans

  - Recursive import chasing

  - Speculative architecture inference



---



## Project Overview

- Purpose: (brief 1–2 lines)

- High-level architecture: (monolith / services / frontend-backend split)

- Key directories:

  - src/

  - docs/

  - scripts/

- Important links/docs:

  - README.md

  - docs/



If information is missing, assume standard conventions and continue.



---



## Default Stack

- Language(s):

- Framework(s):

- Package manager:

- Runtime / versions:

- Database / queues / cache:



Do NOT guess exotic tooling unless explicitly stated.



---



## Commands (copy/paste friendly)

- Install:

- Dev:

- Build:

- Test:

- Lint:

- Format:

- Typecheck:

- Migrations:

- Seeds:



If commands are unknown look for package.json in root otherwise, ask ONCE or assume common defaults.



---



## Coding Standards

- Naming conventions: Follow existing file patterns

- Error handling: Explicit, no silent failures

- Logging: Structured, avoid console spam

- Timezones / dates: UTC unless stated

- Input validation: Required at boundaries

- Performance constraints: Avoid unnecessary loops, scans, or allocations



Never rewrite unrelated code to “improve style”.



---



## API / Interfaces

- Conventions: REST unless stated otherwise

- AuthN/AuthZ: Assume token-based auth

- Pagination/filtering: Explicit parameters only

- Error response shape: Stable and predictable



Do NOT invent endpoints or contracts.



---



## Testing Rules

- Required test types: As defined by project

- Coverage expectations: Minimal unless specified

- Test naming: Mirror source structure

- Mocking:

  - External services MUST be mocked

  - No real network or DB calls unless explicitly allowed



Do not expand test scope without permission.



---



## Security & Compliance

- Secrets handling:

  - Never hardcode secrets

  - Never print secrets

- Data classification:

  - Treat user data as sensitive by default

- PII rules:

  - Avoid logging PII

- Dependencies:

  - Do not add new dependencies without approval



---



## Git / PR Rules

- Branch naming: Follow existing patterns

- Commit messages: Clear and scoped

- PR size: Small and reviewable

- Required checks: Respect CI configuration



Do not squash, rebase, or modify history unless instructed.



---



## “Do / Don’t” Quick List



### Do

- Work only on requested files

- Keep outputs concise

- Make minimal, reversible changes

- Ask before expanding scope



### Don’t

- Scan the entire repository

- Refactor without permission

- Introduce new tools or libraries

- Over-explain or add commentary



---



## Agent Behavior Preferences

- Verbosity: Concise by default

- Refactors: Ask before doing

- Dependencies: Ask before adding

- File access:

  - Read only explicitly referenced files

  - Never crawl directories

- Commands:

  - Do NOT run commands unless asked

- Documentation:

  - Update docs only if changes require it



When unsure, choose the least disruptive option.



---



## Owners / Contacts

- Maintainers:Rudresh Suryawanshi

- Reviewers:

- On-call / escalation:


