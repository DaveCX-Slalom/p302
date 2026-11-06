<script setup>
import { computed, ref } from 'vue';
import { rateByMonth } from '../composables/useReadmissions.js';
import { useWhatIf, projectWhatIf, money } from '../composables/useWhatIf.js';

const props = defineProps({ rows: { type: Array, required: true } });
const { added } = useWhatIf(computed(() => props.rows));

const pct = (v) => `${(v * 100).toFixed(1)}%`;
const firstLast = (id) => {
  const v = rateByMonth(props.rows, [id]);
  return [v[0].rate, v[v.length - 1].rate];
};
const stats = computed(() => {
  const k = Math.max(1, added.value);
  const m = projectWhatIf(props.rows, k);
  const [hf0, hf1] = firstLast('heart_failure');
  const [cp0, cp1] = firstLast('copd');
  const o = props.rows.reduce((a, r) => ({ d: a.d + r.discharges, r: a.r + r.readmissions }), { d: 0, r: 0 });
  return { k, m, hf0, hf1, cp0, cp1, overall: o.r / o.d };
});

const recs = computed(() => {
  const { k, m } = stats.value;
  return [
    {
      title: 'Prioritize discharge support for heart failure and COPD',
      body: 'These two conditions are the ones rising while the average stays flat.',
    },
    {
      title: 'Review weekend discharge staffing',
      body: `Adding ${k} weekend discharge nurse${k > 1 ? 's' : ''} could avoid about ${Math.round(m.avoided)} readmissions a year (about ${money(m.avoidedCost)}, illustrative).`,
    },
    {
      title: 'Track readmissions by shift, not just overall',
      body: 'The overall rate hid this for two years. A shift-level view would have shown it.',
    },
  ];
});

const summaryText = computed(() => {
  const s = stats.value;
  return [
    'Why do patients come back? (illustrative data, fictional hospital)',
    '',
    `Finding 1: Readmissions held at ${pct(s.overall)} overall, but heart failure (${pct(s.hf0)} to ${pct(s.hf1)}) and COPD (${pct(s.cp0)} to ${pct(s.cp1)}) are rising.`,
    `Finding 2: Weekend discharges for these two conditions return at ${(s.m.rate / s.m.weekdayRate).toFixed(1)}x the weekday rate (${pct(s.m.rate)} vs ${pct(s.m.weekdayRate)}).`,
    `Finding 3: Staffing is linked to readmissions (a relationship, not proof of cause). A simple estimate says ${s.k} added weekend discharge nurse${s.k > 1 ? 's' : ''} could avoid about ${Math.round(s.m.avoided)} readmissions a year.`,
    '',
    'Next steps:',
    ...recs.value.map((r, i) => `${i + 1}. ${r.title}. ${r.body}`),
  ].join('\n');
});

const status = ref(''); // '' | 'copied' | 'failed'
async function copy() {
  try {
    await navigator.clipboard.writeText(summaryText.value);
    status.value = 'copied';
  } catch {
    status.value = 'failed';
  }
  setTimeout(() => { if (status.value === 'copied') status.value = ''; }, 3000);
}
</script>

<template>
  <section id="next-steps" class="beat alt" aria-labelledby="b6-title">
    <div class="beat-inner">
      <div class="beat-text">
        <p class="kicker">6 of 6 · Next steps</p>
        <h2 id="b6-title">Three things to do next.</h2>
        <p>It's two conditions and one shift pattern, and you can act on it.</p>
      </div>
      <div class="beat-stage">
        <ol class="recs">
          <li v-for="(r, i) in recs" :key="i">
            <span class="n" aria-hidden="true">{{ i + 1 }}</span>
            <div>
              <h3>{{ r.title }}</h3>
              <p>{{ r.body }}</p>
            </div>
          </li>
        </ol>
        <div class="actions">
          <button type="button" class="copy" @click="copy">Copy summary</button>
          <span class="status" role="status">
            <template v-if="status === 'copied'">Copied to your clipboard.</template>
            <template v-else-if="status === 'failed'">Couldn't copy automatically. Select the text below instead.</template>
          </span>
        </div>
        <textarea v-if="status === 'failed'" class="fallback" readonly rows="10" :value="summaryText" aria-label="Summary text" @focus="$event.target.select()"></textarea>
      </div>
    </div>
  </section>
</template>

<style scoped>
.recs { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-3); max-width: 40rem; }
.recs li {
  display: grid; grid-template-columns: auto 1fr; gap: var(--space-3); align-items: start;
  background: var(--color-surface); border: 1px solid var(--color-grey-line); border-radius: var(--radius); padding: var(--space-3);
}
.n {
  display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border-radius: 50%;
  background: var(--color-teal); color: var(--color-surface); font-weight: 700;
}
h3 { margin: 0 0 var(--space-1); font-family: var(--font-serif); font-size: var(--text-lg); }
.recs p { margin: 0; color: var(--color-ink-muted); }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); }
.copy {
  font: inherit; font-weight: 600; min-height: 48px; padding: 0 var(--space-4);
  background: var(--color-teal); color: var(--color-surface); border: 0; border-radius: var(--radius); cursor: pointer;
}
.copy:hover { background: var(--color-ink); }
.status { color: var(--color-ink-muted); font-size: var(--text-sm); }
.fallback { width: 100%; max-width: 40rem; font: inherit; font-size: var(--text-sm); padding: var(--space-3); border: 1px solid var(--color-grey-line); border-radius: var(--radius); }
</style>
