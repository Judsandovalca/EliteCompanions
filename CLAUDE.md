# Project Rules

## TypeScript
- Never cast as `any` or use `eslint-disable` for `@typescript-eslint/no-explicit-any`. Always define proper types/interfaces for query responses and data structures. If a type is complex, create it in a shared `types.ts` file.
