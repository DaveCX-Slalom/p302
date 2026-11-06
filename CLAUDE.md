# CLAUDE.md: P302 "Why Do Patients Come Back?"

## Start every session by
1. Reading `BRIEF.md` and everything in `docs/memory-bank/`.
2. Checking `activeContext.md` for the current focus and `progress.md` for what's done.

## End every session by
Updating `activeContext.md` (focus, next steps, open questions) and `progress.md` (done/in-progress), and logging any new choice in `decisions.md`.

## Project
Scroll-driven interactive data story for a hospital COO about 30-day readmissions. Invented data only. No client or Slalom information.

## Stack
Vue 3 + Vite, D3 (scales/paths) or Chart.js, VueUse (`useIntersectionObserver`). Pinia only if needed. Deployed on Vercel (public; password protection was dropped because the data is fictional, see `docs/memory-bank/decisions.md` #14).

## Conventions
- Components in `src/components/`, one per story beat in `src/sections/` (`Beat1Hook.vue`, etc.).
- Shared state and data loading in `src/composables/`.
- Design tokens (color, type, spacing) are CSS variables in `src/assets/tokens.css`. Never hardcode colors.
- Coral accent is reserved for "the problem". Everything else is teal or grey.
- Charts use direct labels, not legends. Every chart has a text alternative.
- Respect `prefers-reduced-motion` (static fallback).
- Data comes from `data/generate.js` (seeded). Footer must say "Illustrative data."

## Commits
Small and descriptive, imperative mood (e.g. `Build beat 3 shift breakdown chart`). No `update` or `fix` alone.

## Definition of done (per beat)
Works at 375/768/1280px, handles empty/loading/error states, keyboard accessible, matches BRIEF.md.
