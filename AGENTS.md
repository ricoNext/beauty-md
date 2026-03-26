# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Beauty MD is a Next.js 16 Markdown editor that converts Markdown to WeChat-compatible HTML. See `CLAUDE.md` for full architecture details.

### Running the app

- `npm run dev` starts the dev server on `localhost:3000`
- The app requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars (used by the middleware). A `.env.local` with placeholder values is sufficient for local dev if Supabase auth is not needed — the core Markdown editor and WeChat copy features work without a real Supabase instance.
- If `.env.local` is missing, the middleware will crash with a 500 error on every request.

### Linting and formatting

- Uses **Biome** (not ESLint): `npm run lint` and `npm run format`
- The existing codebase has pre-existing Biome warnings/errors (mostly `!important` usage in CSS and some code style warnings). These are not regressions.

### Testing

- No test framework is configured. Validate changes via `npm run build` and manual testing.

### Key caveats

- The `middleware.ts` runs Supabase session refresh on every request. Without valid Supabase env vars it throws; placeholder values prevent the crash but auth features won't work.
- `package-lock.json` is the lockfile — use `npm install` (not pnpm/yarn/bun).
- React Compiler is enabled in `next.config.ts`.
