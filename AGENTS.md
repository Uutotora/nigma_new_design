# Repository Guidelines

## Project Structure & Module Organization
This project is a Quasar + Vue 3 + TypeScript SPA.
- `src/pages/`: route-level pages (e.g., `UsersPage.vue`, `AnalyticsPage.vue`).
- `src/components/`: reusable UI blocks (`AppHeader.vue`, `DashboardCard.vue`).
- `src/layouts/`: app shell (`MainLayout.vue`).
- `src/router/`: route definitions and router setup.
- `src/data/` and `src/types/`: local data mocks and shared TS types.
- `src/css/`: global styles and static assets (SVG/PNG), with base styles in `app.scss`.
- `.github/workflows/`: CI/CD workflows (GitHub Pages deploy).

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start local Quasar dev server with hot reload.
- `npm run build`: produce production build via Quasar.
- `npm run lint`: run ESLint on `.js`, `.ts`, and `.vue` files in `src`.
- `npx vue-tsc --noEmit`: optional strict TypeScript check.

## Coding Style & Naming Conventions
- Use TypeScript for logic and Vue SFCs for UI.
- Indentation: 2 spaces; keep formatting consistent with existing files.
- Components/pages/layouts: PascalCase file names (`UsersListPage.vue`).
- Utility/data modules: camelCase names (`exportUsers.ts`, `users.ts`).
- Keep page-level logic in `src/pages`, move reusable code to `src/components` or `src/utils`.
- Do not commit temporary build artifacts like `quasar.config.ts.temporary.compiled.*.mjs`.

## Testing Guidelines
There is currently no dedicated automated test suite in this repository.
Before opening a PR:
1. Run `npm run lint`.
2. Run `npm run build` to catch integration/type issues.
3. Smoke-test changed flows in `npm run dev` (navigation, tables, exports, dashboard cards).

## Commit & Pull Request Guidelines
Follow the existing commit style: short imperative subject lines, optionally with scope (e.g., `Update dashboard UI: sidebar, cards, analytics, styles`).
- Keep commits focused and logically grouped.
- PRs should include: purpose, key changes, impacted pages/components, and manual test notes.
- Attach screenshots/GIFs for UI changes.
- Link related issue/task IDs when available.
