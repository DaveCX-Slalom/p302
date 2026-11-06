# Active Context

_Last updated: 2026-11-06 (Session 1)_

## Current focus
Build complete and checked. Remaining: deploy (needs the user's Netlify account).

## Next steps
1. Create the Netlify site from the GitHub repo, set `SITE_PASSWORD`, deploy, then verify the 401 gate on the live URL.
2. Put the live URL in README and tick the "site live" item in BRIEF.md section 10.
3. Delete `public/_frames.html`. Do a manual screen reader and real-device pass.

## Open questions
- None blocking. Vercel was the original idea; Netlify was chosen because the password gate is an edge function that works on any plan.

## Notes for next session
- Memory bank lives in `docs/memory-bank/`; `docs/story-outline.md` and `docs/data-notes.md` hold the beat copy and data design.
- Field name is `nurse_ratio`; `rate` is derived. Generator seed 2024: blended 14.2%, HF 15.0% to 21.0%, COPD 14.3% to 18.9%, HF+COPD weekend 1.98x weekday, HF+COPD r=0.86 (all rows 0.44), pooled slope about 5.7 pt per +1 patient/nurse.
- Scaffold: `npm run data` regenerates the data; `npm run dev` / `npm run build`.
- Shared pieces: `TrendChart`, `BarChart`, `ScatterChart`, `StateMessage`, `ConditionChips`, `useTween`, `useConditionFilter`, `useWhatIf` (model plus shared slider value), `stats.js`.
- What-if model (`useWhatIf.js`): pooled HF + COPD slope; last 12 months weekend discharges; assumes 8 weekend nurses today and $15,000 per readmission (both illustrative, shown on screen); projected rate never goes below the weekday rate.
- Beat 6 reuses the slider value from beat 5 (minimum 1) for its numbers and the copy-summary text.
- Coral `#bf3a30` and grey marks `#76868a` chosen for AA contrast.
- Fixed a `useTween` bug where rAF timestamps could make easing negative (negative SVG widths).
- Browser checks use puppeteer-core from the session scratchpad (not a project dependency).
- Cleanup: `public/_frames.html` is a leftover temporary test page; delete it (never committed).
- Tooling note: shell commands that mix heredocs with Python edits were sometimes blocked by a safety check; the Edit/Write tools avoid that.
