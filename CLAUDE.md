# Project Rules

## TypeScript
- Never cast as `any` or use `eslint-disable` for `@typescript-eslint/no-explicit-any`. Always define proper types/interfaces for query responses and data structures. If a type is complex, create it in a shared `types.ts` file.

## SVG Icons
- Never inline large/complex SVG paths directly in page or component files. Instead, create a reusable icon component in `client/src/components/icons/` and import it. Small, simple SVGs (e.g. chevrons, dots, basic UI indicators) are fine inline.
