# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — run ESLint over the repo

There is no test runner configured in this project.

Note: the `/api` serverless function only runs under the Vercel platform (`vercel dev` or a deployment), not under `npm run dev`. The AI advisor feature will fail locally unless the API route is served by Vercel.

## Architecture

Single-page React 19 app (Vite + Tailwind CSS v4) for personal finance tracking, written in Spanish. Backend is Supabase (auth + Postgres); a thin Vercel serverless function proxies Google Gemini.

### Data flow & layers

- **Auth gate** — `src/App.jsx` holds the Supabase `session` in state, subscribes to `onAuthStateChange`, and drives routing. `/login` is public; `/dashboard` is wrapped by `src/components/ProtectedRoute.jsx` (redirects to `/login` when `session` is null). Unknown routes redirect based on session presence.
- **Supabase client** — `src/supabaseClient.jsx` is the single shared client, configured from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Dashboard** (`src/pages/Dashboard.jsx`) is the core stateful container. It owns all income/debt state, performs all Supabase reads/writes inline, computes derived financial metrics with `useMemo` (totals, debt-to-income %, suggested weekly budget = 80% of free money / 4, 20% suggested savings), and passes data + handlers down to presentational `Tarjeta*` / `Gestor*` components in `src/components/`.

### Database

All income and debt records live in a single Supabase table `finanzas_personales` with columns: `id`, `user_id`, `concepto` (name), `monto` (amount), `tipo` (`'ingreso'` or `'deuda'`). Rows are filtered by `tipo` in the client to split incomes from debts. Queries scope to the current user via `user_id` — assume Row Level Security is the enforcement boundary.

### AI advisor

`src/components/TarjetaAsesorIA.jsx` triggers `generateAdvice()` in `Dashboard.jsx`, which POSTs a Gemini-format payload (`contents` + `systemInstruction`) to `/api/getAdvice` with exponential-backoff retry. `api/getAdvice.js` (Vercel serverless) reads `GEMINI_API_KEY` from the server environment and proxies to the Gemini `gemini-2.5-flash-lite` endpoint — the key is never exposed to the browser. The system prompt instructs Gemini to act as a Spanish-language financial advisor returning bulleted advice.

## Conventions

- Code, comments, and UI strings are in **Spanish**. Match this when editing.
- Components are split into stateless presentational pieces (`Tarjeta*` = cards, `Gestor*` = list/form managers) that receive state and handlers as props from `Dashboard.jsx`. Keep business logic and data access in `Dashboard.jsx`, not in these components.
- Currency is formatted via `Intl.NumberFormat('es-CO', { currency: 'COP' })` (`formatCurrency` in `Dashboard.jsx`).
- Styling is Tailwind utility classes only (Tailwind v4 via `@tailwindcss/vite`); there is no separate component CSS.

## Environment & deployment

- Env vars live in `.env.local` (gitignored). Client vars must be prefixed `VITE_`; `GEMINI_API_KEY` is server-only and set in Vercel project settings.
- Deployed on Vercel. `vercel.json` rewrites all non-`/api`, non-asset paths to `/index.html` so the React Router SPA handles deep links (fixes 404s on refresh).
- Google OAuth redirects to `window.location.origin`; ensure that origin is whitelisted in Supabase auth settings for each deployment URL.
