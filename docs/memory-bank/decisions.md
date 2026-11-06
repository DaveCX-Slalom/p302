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
| 11 | 2026-11-06 | Scatter uses two tones (weekend coral, weekday teal) and shows HF + COPD only | Weekday shifts overlap; all-condition correlation is weak (r 0.44) | Three tones, all conditions |
| 12 | 2026-11-06 | What-if assumes 8 weekend nurses today, $15,000 per readmission, and never projects below the weekday rate | Keeps the estimate inside the observed pattern; assumptions shown on screen | Unbounded linear extrapolation |
| 13 | 2026-11-06 | Beat 6 reuses the beat 5 slider value (minimum 1) | Summary numbers match what the reader just saw | Fixed +1 scenario |
| 14 | 2026-11-06 | Deploy on Vercel as a public site; no password protection (a Netlify password gate was built, then removed) | The project is fictional and holds no real data, so there is nothing to protect | Password gate via middleware or Vercel paid protection |
| 15 | 2026-11-06 | Add a fictional hospital brand ("Northfield General", tagged Fictional), sticky nav with scroll progress, intro with glossary, and fuller footer | First deploy felt basic and gave no context; the story needs who, what and when before the first chart | Jump straight into beat 1 |
| 16 | 2026-11-06 | Two-column beat layout on wide screens (sticky text left, chart right), stacked on narrow ones, with alternating section bands | Uses desktop width, keeps the text in view while the reader interacts, matches the brief's side annotations | Single centered column |
