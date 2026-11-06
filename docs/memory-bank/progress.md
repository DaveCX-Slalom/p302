# Progress

## Done
- [x] BRIEF.md, README, LICENSE, CLAUDE.md
- [x] Memory bank, story-outline.md, data-notes.md
- [x] Data generator (`data/generate.js`, seed 2024, writes `data/readmissions.json` and `public/readmissions.json`, sanity checks pass)
- [x] Vue 3 + Vite scaffold, design tokens (`tokens.css`), data loader with loading/error states
- [x] Beat 1: flat line (scroll reveal, text alternative, keyboard readout)
- [x] Beat 2: split by condition (chips, empty state, direct labels)
- [x] Beat 3: shift breakdown (grouped bars HF + COPD, chips, empty state, hidden data table)
- [x] Beat 4: staffing scatter (HF + COPD rows, trend line, r, caveat, arrow-key readout)
- [x] Beat 5: what-if slider (linear estimate, keyboard operable, assumptions on screen)
- [x] Beat 6: takeaway and copy summary (clipboard with textarea fallback)

- [x] Empty/loading/error states checked in browser (error via a forced 500, empty via hiding chips)
- [x] Responsive check at 375/768/1280 (no horizontal overflow)
- [x] Reduced-motion check (final state shown, no animation)
- [x] Accessibility pass: axe audit (WCAG 2 A/AA plus best practices) clean at 375/768/1280 and with reduced motion
- [x] Netlify password gate (edge function, logic tested locally)
- [x] README and BRIEF.md synced to the build ("As built" section)

## In progress
- [ ] Deploy with password protection (needs a Netlify account and `SITE_PASSWORD`)

## To do
- [ ] Add the live URL to README
- [ ] Delete leftover `public/_frames.html` (untracked)
- [ ] Manual screen reader and real-device pass (not covered by automated checks)

## Session log
| Date | Session | Summary |
|------|---------|---------|
| 2026-11-06 | 1 | Read brief, reconciled docs (memory bank moved to docs/memory-bank/, field names aligned), logged decisions, built seeded data generator, scaffolded Vue app and tokens, built all six beats (checked at 375/768/1280 with no horizontal overflow). |
