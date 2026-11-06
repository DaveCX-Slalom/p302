<script setup>
import { computed, ref } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import { CONDITIONS, rateByShift } from '../composables/useReadmissions.js';
import { useConditionFilter } from '../composables/useConditionFilter.js';
import { useTween } from '../composables/useTween.js';
import BarChart from '../components/BarChart.vue';
import ConditionChips from '../components/ConditionChips.vue';
import StateMessage from '../components/StateMessage.vue';

const props = defineProps({ rows: { type: Array, required: true } });

const el = ref(null);
const seen = ref(false);
useIntersectionObserver(el, ([e]) => { if (e.isIntersecting) seen.value = true; }, { threshold: 0.4 });
const reveal = useTween(computed(() => (seen.value ? 1 : 0)), 1100);

const { selected, reset } = useConditionFilter();
const problems = CONDITIONS.filter((c) => c.problem);
const shown = computed(() => problems.filter((c) => selected.value.has(c.id)));

const groups = computed(() =>
  shown.value.map((c) => ({
    id: c.id,
    label: c.label,
    bars: rateByShift(props.rows, c.id).map((s) => ({
      id: s.shift,
      label: s.label,
      lines: s.lines,
      short: s.short,
      value: s.rate,
      tone: s.shift === 'weekend' ? 'coral' : 'teal',
    })),
  })),
);

const pct = (v) => `${(v * 100).toFixed(1)}%`;
// Weekend vs weekday multiple across the conditions on screen.
const multiple = computed(() => {
  let wd = 0, wr = 0, kd = 0, kr = 0;
  for (const r of props.rows) {
    if (!shown.value.some((c) => c.id === r.condition)) continue;
    if (r.shift === 'weekend') { wd += r.discharges; wr += r.readmissions; }
    else { kd += r.discharges; kr += r.readmissions; }
  }
  return wd && kd ? wr / wd / (kr / kd) : null;
});
const multipleText = computed(() => (multiple.value ? `${multiple.value.toFixed(1)}x` : ''));
const summary = computed(() =>
  groups.value
    .map((g) => `${g.label}: ${g.bars.map((b) => `${b.label} ${pct(b.value)}`).join(', ')}.`)
    .join(' ') + (multiple.value ? ` Weekend discharges return at ${multipleText.value} the weekday rate.` : ''),
);
</script>

<template>
  <section ref="el" class="beat" aria-labelledby="b3-title">
    <div class="text">
      <h2 id="b3-title">Same conditions, different shifts.</h2>
      <p>
        Heart failure and COPD patients discharged on a weekend come back far more often than those
        discharged on a weekday.
      </p>
    </div>
    <ConditionChips />
    <StateMessage
      v-if="!shown.length"
      kind="empty"
      message="Heart failure and COPD are both hidden. Turn one back on to compare shifts."
      @action="reset"
    />
    <BarChart
      v-else
      :groups="groups"
      :reveal="reveal"
      title="Readmission rate by discharge shift for heart failure and COPD"
      :summary="summary"
    />
    <p v-if="multiple" class="callout">Weekend discharges return at about {{ multipleText }} the weekday rate.</p>
  </section>
</template>

<style scoped>
.beat {
  min-height: 100vh; display: flex; flex-direction: column; justify-content: center;
  gap: var(--space-3); padding: var(--space-6) var(--gutter);
  max-width: calc(var(--chart-max) + 2 * var(--gutter)); margin: 0 auto;
}
.text { max-width: var(--measure); }
.callout {
  max-width: var(--measure); padding: var(--space-3); margin: 0;
  border-left: 4px solid var(--color-coral); background: var(--color-coral-tint);
  border-radius: 0 var(--radius) var(--radius) 0; font-weight: 600;
}
</style>
