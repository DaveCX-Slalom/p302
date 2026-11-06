<script setup>
import { computed, ref } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import { CONDITIONS, SHIFTS } from '../composables/useReadmissions.js';
import { useConditionFilter } from '../composables/useConditionFilter.js';
import { useTween } from '../composables/useTween.js';
import { regress } from '../composables/stats.js';
import ScatterChart from '../components/ScatterChart.vue';
import ConditionChips from '../components/ConditionChips.vue';
import StateMessage from '../components/StateMessage.vue';

const props = defineProps({ rows: { type: Array, required: true } });

const el = ref(null);
const seen = ref(false);
useIntersectionObserver(el, ([e]) => { if (e.isIntersecting) seen.value = true; }, { threshold: 0.4 });
const reveal = useTween(computed(() => (seen.value ? 1 : 0)), 900);

const { selected, reset } = useConditionFilter();
const problemIds = CONDITIONS.filter((c) => c.problem).map((c) => c.id);
const condLabel = Object.fromEntries(CONDITIONS.map((c) => [c.id, c.label]));
const shiftLabel = Object.fromEntries(SHIFTS.map((s) => [s.id, s.label]));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtMonth = (m) => `${MONTHS[+m.slice(5) - 1]} ${m.slice(0, 4)}`;
const pct = (v) => `${(v * 100).toFixed(1)}%`;

const sel = computed(() => props.rows.filter((r) => problemIds.includes(r.condition) && selected.value.has(r.condition)));
const points = computed(() =>
  sel.value.map((r, i) => ({
    id: i,
    x: r.nurse_ratio,
    y: r.rate,
    tone: r.shift === 'weekend' ? 'coral' : 'teal',
    desc: `${shiftLabel[r.shift]}, ${condLabel[r.condition]}, ${fmtMonth(r.month)}: ${r.nurse_ratio.toFixed(1)} patients per nurse, ${pct(r.rate)} readmitted`,
  })),
);
const fit = computed(() => regress(points.value, (p) => p.x, (p) => p.y));

const clusters = computed(() => {
  const out = [];
  for (const [tone, text] of [['coral', 'Weekend'], ['teal', 'Weekday']]) {
    const ps = points.value.filter((p) => p.tone === tone);
    if (!ps.length) continue;
    out.push({
      text, tone,
      x: ps.reduce((s, p) => s + p.x, 0) / ps.length,
      y: Math.max(...ps.map((p) => p.y)) + 0.025,
    });
  }
  return out;
});

const strength = computed(() => {
  if (!fit.value) return '';
  const a = Math.abs(fit.value.r);
  return a >= 0.7 ? 'strong' : a >= 0.4 ? 'moderate' : 'weak';
});
const perPatient = computed(() => (fit.value ? (fit.value.slope * 100).toFixed(1) : ''));
const names = computed(() => problemIds.filter((id) => selected.value.has(id)).map((id) => condLabel[id]).join(' and '));
const summary = computed(() =>
  fit.value
    ? `Scatter plot of ${points.value.length} monthly shift results for ${names.value}. Readmission rate rises with patients per nurse. The relationship is ${strength.value} (r = ${fit.value.r.toFixed(2)}): about ${perPatient.value} more readmissions per 100 discharges for each extra patient per nurse. Weekend shifts sit at the thin-staffing, high-readmission end.`
    : 'Not enough points to show a relationship.',
);
</script>

<template>
  <section id="staffing" ref="el" class="beat alt" aria-labelledby="b4-title">
    <div class="beat-inner">
      <div class="beat-text">
        <p class="kicker">4 of 6 · A likely reason</p>
        <h2 id="b4-title">Fewer nurses at discharge, more patients back.</h2>
        <p>
          Each dot is one month on one shift. The thinner the nurse staffing, the higher the share of
          patients who return.
        </p>
        <p v-if="fit" class="note">
          The link is {{ strength }} (r = {{ fit.r.toFixed(2) }}). Each extra patient per nurse goes with about
          {{ perPatient }} more readmissions per 100 discharges.
        </p>
        <p class="callout teal">This shows a relationship, not proof of cause.</p>
      </div>
      <div class="beat-stage">
        <ConditionChips />
        <StateMessage
          v-if="!points.length"
          kind="empty"
          message="Heart failure and COPD are both hidden. Turn one back on to see the staffing link."
          @action="reset"
        />
        <ScatterChart
          v-else
          :points="points"
          :trend="fit"
          :clusters="clusters"
          :reveal="reveal"
          title="Readmission rate against patients per discharge nurse"
          :summary="summary"
          x-label="Patients per discharge nurse (higher = thinner staffing)"
          x-label-short="Patients per nurse (higher = thinner)"
          y-label="Readmission rate"
        />
      </div>
    </div>
  </section>
</template>
