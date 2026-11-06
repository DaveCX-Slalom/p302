# Active Context

_Last updated: 2026-11-06 (Session 1)_

## Current focus
Repo scaffolding done and committed; building the seeded data generator (`data/generate.js`).

## Next steps
1. Finish `data/generate.js` with the planted weekend/HF/COPD pattern and failing sanity checks.
2. Scaffold Vue 3 + Vite app and design tokens (`src/assets/tokens.css`).
3. Build beats 1 and 2.

## Open questions
- Cost per readmission for the avoided-cost output (illustrative flat value, must be stated on screen).

## Notes for next session
- Memory bank lives in `docs/memory-bank/`; `docs/story-outline.md` and `docs/data-notes.md` hold the beat copy and data design.
- Field name is `nurse_ratio` (BRIEF.md updated to match). `rate` is derived.
- What-if scope: HF + COPD weekend discharges only, one pooled linear slope.
- Decided: D3 (scales/paths) for charts; linear what-if estimate. See `decisions.md`.
- Risk: blended rate must stay ~14.2% while HF/COPD rise; generator must calibrate and fail loudly.
