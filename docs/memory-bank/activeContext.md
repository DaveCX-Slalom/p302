# Active Context

_Last updated: 2026-11-06 (Session 1)_

## Current focus
Beats 1 and 2 built. Next: beats 3 and 4.

## Next steps
1. Beat 3: grouped bars for HF + COPD by shift (weekend bar ~2x). Reuse `useConditionFilter`.
2. Beat 4: scatter of `nurse_ratio` vs `rate`, HF + COPD rows, trend line, "relationship, not proof" caveat.
3. Beat 5 what-if slider (linear slope, HF + COPD weekend only), then beat 6.

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
- Scaffold: `npm run data` regenerates `data/readmissions.json` and `public/readmissions.json`; `npm run dev` / `npm run build`.
- Shared pieces: `TrendChart.vue` (d3 scales/paths, end labels, arrow-key readout), `StateMessage.vue`, `ConditionChips.vue`, `useTween`, `useConditionFilter`.
- Coral darkened to `#bf3a30` and grey marks to `#76868a` for AA contrast on the off-white background.
- Browser checks use puppeteer-core in the session scratchpad (not a project dependency).
- Cleanup: `public/_frames.html` is a leftover temporary test page and should be deleted (not committed).
