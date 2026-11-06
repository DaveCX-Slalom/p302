# Active Context

_Last updated: 2026-11-06 (Session 1)_

## Current focus
Built, deployed (https://p302-five.vercel.app/) and polished once after the first deploy. Anything further is optional refinement.

## Next steps
1. Check the redeployed site after the push (Vercel builds from `main`).
2. Manual screen reader and real-device pass (automated checks do not cover these).
3. Optional ideas: a sticky "scrollytelling" chart that updates as text steps scroll, annotations drawn on the charts, a printable one-page summary.
4. Delete `public/_frames.html` (untracked temporary test page).

## Open questions
- None blocking.

## Notes for next session
- Memory bank lives in `docs/memory-bank/`; `docs/story-outline.md` and `docs/data-notes.md` hold the beat copy and data design.
- Field name is `nurse_ratio`; `rate` is derived. Generator seed 2024: blended 14.2%, HF 15.0% to 21.0%, COPD 14.3% to 18.9%, HF+COPD weekend 1.98x weekday, HF+COPD r=0.86 (all rows 0.44), pooled slope about 5.7 pt per +1 patient/nurse.
- Scaffold: `npm run data` regenerates the data; `npm run dev` / `npm run build`.
- Page structure: `SiteNav` (sticky, fictional brand, jump links, progress), `IntroHero` (facts computed from data, glossary), six beat sections (`id`s: overview, conditions, shifts, staffing, what-if, next-steps), footer in `App.vue`.
- Shared layout classes (`.beat`, `.beat.alt`, `.beat-inner`, `.beat-text`, `.beat-stage`, `.callout`, `.note`, `.kicker`) live in `base.css`.
- Shared pieces: `TrendChart`, `BarChart`, `ScatterChart`, `StateMessage`, `ConditionChips`, `useTween`, `useConditionFilter`, `useWhatIf` (model plus shared slider value), `stats.js`.
- What-if model: pooled HF + COPD slope; last 12 months weekend discharges; assumes 8 weekend nurses today and $15,000 per readmission (illustrative, shown on screen); projected rate never goes below the weekday rate. Beat 6 reuses the slider value (minimum 1).
- Coral `#bf3a30` and grey marks `#76868a` chosen for AA contrast. Colors only come from `tokens.css`.
- Fixed a `useTween` bug where rAF timestamps could make easing negative.
- Browser checks use puppeteer-core and axe-core from the session scratchpad (not project dependencies).
- Tooling note: shell commands that mix heredocs with Python edits were sometimes blocked by a safety check; the Edit/Write tools avoid that. Shell variables holding a `git` command do not work in this shell; write commands out in full.
