# Active Context

_Last updated: 2026-11-06 (Session 1)_

## Current focus
Scaffolding and data generator done. Next: Vue 3 + Vite app and design tokens.

## Next steps
1. Scaffold Vue 3 + Vite app and design tokens (`src/assets/tokens.css`); decide how the app loads `data/readmissions.json` (copy to `public/` or import).
2. Build beats 1 and 2.
3. Add a root `package.json` with `"type": "module"` (generator is ESM) and a `npm run data` script.

## Open questions
- Cost per readmission for the avoided-cost output (illustrative flat value, must be stated on screen).

## Notes for next session
- Memory bank lives in `docs/memory-bank/`; `docs/story-outline.md` and `docs/data-notes.md` hold the beat copy and data design.
- Field name is `nurse_ratio` (BRIEF.md updated to match). `rate` is derived.
- What-if scope: HF + COPD weekend discharges only, one pooled linear slope.
- Decided: D3 (scales/paths) for charts; linear what-if estimate. See `decisions.md`.
- Risk: blended rate must stay ~14.2% while HF/COPD rise; generator must calibrate and fail loudly.
- Generator: seed 2024. Blended rate ~14.2% (max monthly deviation 0.30 pt). HF 15.0% to 21.0%, COPD 14.3% to 18.9%, HF+COPD weekend is 1.98x weekday. Weekend nurse_ratio 40% worse. HF+COPD r=0.86 (all rows r=0.44), pooled slope about 5.7 pt of rate per +1 patient/nurse.
- Beat 4 scatter should focus on HF + COPD rows (all-row correlation is weak).
