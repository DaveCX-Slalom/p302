<script setup>
import { computed } from 'vue';

const props = defineProps({ rows: { type: Array, required: true } });

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (m) => `${MONTHS[+m.slice(5) - 1]} ${m.slice(0, 4)}`;

// Context numbers come from the data so they cannot drift from the charts.
const facts = computed(() => {
  const months = [...new Set(props.rows.map((r) => r.month))].sort();
  const conditions = new Set(props.rows.map((r) => r.condition)).size;
  const shifts = new Set(props.rows.map((r) => r.shift)).size;
  const discharges = props.rows.reduce((s, r) => s + r.discharges, 0);
  return [
    { value: `${months.length} months`, label: `${fmt(months[0])} to ${fmt(months[months.length - 1])}` },
    { value: `${discharges.toLocaleString('en-US')} discharges`, label: 'across the period' },
    { value: `${conditions} conditions`, label: 'tracked separately' },
    { value: `${shifts} discharge shifts`, label: 'weekday day, weekday evening, weekend' },
  ];
});

const TERMS = [
  { term: '30-day readmission', def: 'A patient comes back to the hospital within 30 days of going home. The readmission rate is the share of discharges that do.' },
  { term: 'Patients per nurse', def: 'How many discharged patients one nurse looks after on a shift. A higher number means thinner staffing.' },
  { term: 'Correlation', def: 'Two numbers that move together. It is a clue, not proof that one causes the other.' },
];
</script>

<template>
  <section id="top" class="hero" aria-labelledby="hero-title">
    <div class="inner">
      <!-- Decorative heartbeat line. No data, hidden from assistive tech. -->
      <svg class="pulse" viewBox="0 0 600 180" aria-hidden="true" focusable="false">
        <path class="faint" pathLength="1" d="M0 100 H110 L130 92 L150 100 H195 L212 114 L240 22 L268 156 L290 100 H350 L375 78 L405 100 H600" />
        <path class="bright" pathLength="1" d="M0 100 H110 L130 92 L150 100 H195 L212 114 L240 22 L268 156 L290 100 H350 L375 78 L405 100 H600" />
      </svg>
      <p class="eyebrow">Quarterly quality review · Briefing for the COO</p>
      <h1 id="hero-title">Why do patients come back?</h1>
      <p class="lede">
        Northfield General Hospital's 30-day readmission rate looks steady. This short story shows what
        the average is hiding, and what one change could do about it.
      </p>

      <ul class="facts" aria-label="What this story covers">
        <li v-for="f in facts" :key="f.value">
          <strong>{{ f.value }}</strong>
          <span>{{ f.label }}</span>
        </li>
      </ul>

      <div class="actions">
        <a class="start" href="#overview">Start the story <span aria-hidden="true">↓</span></a>
        <p class="fiction">Northfield General is a fictional hospital. All data is invented.</p>
      </div>

      <details class="terms">
        <summary>New to these terms?</summary>
        <dl>
          <div v-for="t in TERMS" :key="t.term">
            <dt>{{ t.term }}</dt>
            <dd>{{ t.def }}</dd>
          </div>
        </dl>
      </details>
    </div>
  </section>
</template>

<style scoped>
.hero { background: var(--color-teal-deep); color: var(--color-surface); scroll-margin-top: 0; }
.inner { position: relative; max-width: 76rem; margin: 0 auto; padding: var(--space-6) var(--gutter); }
.inner > :not(.pulse) { position: relative; z-index: 1; }
.pulse { display: none; }
@media (min-width: 1024px) {
  .pulse { display: block; position: absolute; right: var(--gutter); top: 18%; width: min(46%, 34rem); height: auto; }
}
.pulse path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.pulse .faint { stroke: var(--color-teal-soft); stroke-width: 2; opacity: 0.35; }
.pulse .bright {
  stroke: var(--color-on-deep); stroke-width: 3;
  stroke-dasharray: 1; stroke-dashoffset: 1;
  animation: draw 2.6s ease-out 0.3s forwards;
}
@keyframes draw { to { stroke-dashoffset: 0; } }
.eyebrow { font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; color: var(--color-on-deep-muted); margin-bottom: var(--space-3); }
h1 { max-width: 14ch; margin-bottom: var(--space-3); }
.lede { max-width: 38rem; font-size: var(--text-lg); color: var(--color-on-deep); }
.facts {
  list-style: none; padding: 0; margin: var(--space-5) 0 var(--space-4);
  display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); gap: var(--space-3);
  max-width: 56rem;
}
.facts li { border-top: 2px solid rgba(255, 255, 255, 0.35); padding-top: var(--space-2); display: grid; gap: 2px; }
.facts strong { font-family: var(--font-serif); font-size: 1.4rem; font-weight: 600; }
.facts span { font-size: var(--text-sm); color: var(--color-on-deep-muted); }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3) var(--space-4); }
.start {
  display: inline-flex; align-items: center; gap: var(--space-2); min-height: 48px; padding: 0 var(--space-4);
  background: var(--color-surface); color: var(--color-teal-deep); font-weight: 700; text-decoration: none;
  border-radius: var(--radius);
}
.start:hover { background: var(--color-teal-tint); }
.start:focus-visible, summary:focus-visible { outline-color: var(--color-surface); }
.fiction { margin: 0; font-size: var(--text-sm); color: var(--color-on-deep-muted); }
.terms { margin-top: var(--space-5); max-width: 44rem; }
summary { cursor: pointer; min-height: 44px; display: flex; align-items: center; gap: var(--space-2); font-weight: 600; color: var(--color-on-deep); list-style: none; }
summary::-webkit-details-marker { display: none; }
summary::before {
  content: '+'; display: inline-grid; place-items: center; width: 1.5rem; height: 1.5rem;
  border: 1.5px solid currentColor; border-radius: 50%; line-height: 1;
}
details[open] summary::before { content: '\2212'; }
dl { display: grid; gap: var(--space-3); margin: var(--space-2) 0 0; }
dt { font-weight: 700; }
dd { margin: 2px 0 0; color: var(--color-on-deep); }
</style>
