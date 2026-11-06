# Decisions Log

| # | Date | Decision | Why | Alternatives |
|---|------|----------|-----|--------------|
| 1 | 2026-11-06 | Scroll-driven narrative with 6 beats | The story is the point; interaction is secondary | Dashboard-style filters |
| 2 | 2026-11-06 | Coral accent reserved for "the problem" | Guides attention to the finding | Multi-color series |
| 3 | 2026-11-06 | Seeded synthetic data with planted pattern | Reproducible story, no real data | Hand-typed JSON |
| 4 | 2026-11-06 | Direct labels instead of legends | Faster reading for non-analysts | Standard legends |
| 5 | 2026-11-06 | Vue 3 + Vite | Required stack | |
| 6 | 2026-11-06 | D3 (scales/paths) for charts, not Chart.js | Full control over direct labels and annotations | Chart.js |
| 7 | 2026-11-06 | What-if uses a simple linear estimate, scope HF + COPD weekend only | Easy to explain to a non-analyst; matches planted data | Fitted curve, all conditions |
| 8 | 2026-11-06 | Field named `nurse_ratio` (patients per nurse), `rate` derived | Matches data-notes; brief updated | `discharge_nurse_ratio` |
| 9 | 2026-11-06 | Fetch `readmissions.json` at runtime from `public/` | Needed to show real loading and error states | Static JSON import |
| 10 | 2026-11-06 | Coral `#bf3a30`, grey marks `#76868a` | AA contrast for small labels | Lighter coral `#d9534a` (about 3.7:1) |
