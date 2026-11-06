<script setup>
import { computed } from 'vue';
import { useWhatIf, BASELINE_WEEKEND_NURSES, COST_PER_READMISSION, MAX_ADDED, money } from '../composables/useWhatIf.js';
import BarChart from '../components/BarChart.vue';

const props = defineProps({ rows: { type: Array, required: true } });
const { added, model } = useWhatIf(computed(() => props.rows));

const pct = (v) => `${(v * 100).toFixed(1)}%`;
const label = computed(() => (added.value === 1 ? '1 added nurse' : `${added.value} added nurses`));
const groups = computed(() => {
  const m = model.value;
  if (!m) return [];
  return [{
    id: 'weekend',
    label: 'Weekend discharges, heart failure and COPD',
    bars: [
      { id: 'today', label: 'Today', lines: ['Today'], short: ['Today'], value: m.rate, tone: 'coral' },
      { id: 'projected', label: `With ${label.value}`, lines: ['With', label.value.replace('added ', '')], short: ['With', `+${added.value}`], value: m.projectedRate, tone: 'teal' },
    ],
  }];
});
const summary = computed(() => {
  const m = model.value;
  if (!m) return '';
  return `Weekend readmission rate for heart failure and COPD is ${pct(m.rate)} today and ${pct(m.projectedRate)} with ${label.value}. That is about ${Math.round(m.avoided)} fewer readmissions a year, worth about ${money(m.avoidedCost)}.`;
});
</script>

<template>
  <section class="beat" aria-labelledby="b5-title">
    <div class="text">
      <h2 id="b5-title">What would one more weekend discharge nurse change?</h2>
      <p>Move the slider to add weekend discharge nurses and see the projected effect.</p>
    </div>

    <div v-if="model" class="panel">
      <div class="control">
        <label for="added">Added weekend discharge nurses: <strong>{{ added }}</strong></label>
        <input
          id="added" type="range" min="0" :max="MAX_ADDED" step="1" v-model.number="added"
          :aria-valuetext="`${label}`"
        />
        <div class="ticks" aria-hidden="true"><span v-for="n in MAX_ADDED + 1" :key="n">{{ n - 1 }}</span></div>
      </div>

      <BarChart
        :groups="groups"
        :y-max="0.35"
        title="Weekend readmission rate today and with added nurses"
        :summary="summary"
      />

      <dl class="outputs" aria-live="polite">
        <div>
          <dt>Projected weekend readmissions per year</dt>
          <dd>{{ Math.round(model.projected) }} <small>(today {{ Math.round(model.readmissions) }})</small></dd>
        </div>
        <div>
          <dt>Avoided readmissions per year</dt>
          <dd class="good">{{ Math.round(model.avoided) }}</dd>
        </div>
        <div>
          <dt>Avoided cost per year (illustrative)</dt>
          <dd class="good">{{ money(model.avoidedCost) }}</dd>
        </div>
      </dl>
    </div>

    <p class="note">
      Projection is a simple estimate from the pattern above, using weekend discharges from the last 12 months. It assumes {{ BASELINE_WEEKEND_NURSES }} weekend discharge nurses today
      and ${{ COST_PER_READMISSION.toLocaleString('en-US') }} per readmission, and it covers heart failure and COPD weekend
      discharges only. All numbers are illustrative, and the link is a relationship, not proof of cause.
    </p>
  </section>
</template>

<style scoped>
.beat {
  min-height: 100vh; display: flex; flex-direction: column; justify-content: center;
  gap: var(--space-3); padding: var(--space-6) var(--gutter);
  max-width: calc(var(--chart-max) + 2 * var(--gutter)); margin: 0 auto;
}
.text { max-width: var(--measure); }
.panel { display: flex; flex-direction: column; gap: var(--space-3); max-width: var(--chart-max); }
.control { max-width: 28rem; }
label { display: block; margin-bottom: var(--space-2); }
input[type='range'] { width: 100%; min-height: 44px; accent-color: var(--color-teal); cursor: pointer; }
.ticks { display: flex; justify-content: space-between; padding: 0 8px; font-size: var(--text-sm); color: var(--color-ink-muted); }
.outputs { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: var(--space-3); margin: 0; }
.outputs div { background: var(--color-surface); border: 1px solid var(--color-grey-line); border-radius: var(--radius); padding: var(--space-3); }
dt { font-size: var(--text-sm); color: var(--color-ink-muted); }
dd { margin: var(--space-1) 0 0; font-family: var(--font-serif); font-size: 2rem; line-height: 1.1; }
dd small { font-family: var(--font-sans); font-size: var(--text-sm); color: var(--color-ink-muted); }
dd.good { color: var(--color-teal); }
.note { max-width: var(--measure); font-size: var(--text-sm); color: var(--color-ink-muted); margin: 0; }
</style>
