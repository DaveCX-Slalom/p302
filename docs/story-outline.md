# Story Outline: "Why Do Patients Come Back?"

**Audience:** Dana, hospital COO / quality director (non-analyst)
**Core message:** Readmissions aren't everywhere. They're concentrated in two conditions and a weekend discharge pattern, and that's fixable.
**Tone:** calm, plain-language, evidence-led. No jargon without a one-line explanation.

---

## Beat 1: Hook
- **Headline:** "Readmissions held steady at 14.2%. Good news?"
- **Visual:** a single flat line, 24 months.
- **Interaction:** none (let it sit).
- **Copy:** "On paper, nothing's wrong. Look closer."
- **Transition:** the line begins to split as the user scrolls.

## Beat 2: Break it apart
- **Headline:** "The average is hiding two rising problems."
- **Visual:** the line splits into 6 condition lines. Heart failure and COPD rise (coral), the other four stay grey and flat or fall.
- **Interaction:** condition filter chips; hover/tap shows the condition's rate.
- **Annotation:** "Improvements elsewhere are masking the rise."

## Beat 3: Where it happens
- **Headline:** "Same conditions, different shifts."
- **Visual:** grouped bars for HF and COPD by discharge shift (weekday day, weekday evening, weekend). The weekend bars are about 2x taller.
- **Annotation:** "Weekend discharges return at nearly twice the rate."

## Beat 4: A likely reason
- **Headline:** "Fewer nurses at discharge, more patients back."
- **Visual:** scatter of nurse-to-patient ratio (x) against readmission rate (y), colored by shift. A trend line is shown.
- **Caveat (required):** "This shows a relationship, not proof of cause."

## Beat 5: What if?
- **Headline:** "What would one more weekend discharge nurse change?"
- **Visual:** the same HF/COPD weekend bar, with a projected bar that shrinks as the slider moves (0 to 3 added nurses).
- **Interaction:** slider (keyboard accessible). Live outputs: projected readmissions per year, avoided cost (illustrative).
- **Note:** "Projection is a simple estimate from the pattern above."

## Beat 5b (optional): Limits
One short line on assumptions: invented data, linear estimate, no causal claim.

## Beat 6: Takeaway
- **Headline:** "Three things to do next."
  1. Prioritize discharge support for HF and COPD.
  2. Review weekend discharge staffing.
  3. Track readmissions by shift, not just overall.
- **Action:** "Copy summary" button (plain text of the 3 findings and numbers).

---

## Story rules
- One idea per screen. One headline sentence per idea.
- Coral is only used for the problem. Everything else is teal or grey.
- Every chart gets a text alternative and a plain-language annotation.
- Each beat must still make sense with motion off (reduced-motion fallback).

## Checklist
- [ ] Each beat answers "so what?" in one sentence
- [ ] The headline numbers match `data-notes.md`
- [ ] Beats read correctly at 375px (annotations stack under charts)