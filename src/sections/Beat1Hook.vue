<script setup>
import { computed, ref, watch } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import { rateByMonth } from '../composables/useReadmissions.js';
import { useTween } from '../composables/useTween.js';
import TrendChart from '../components/TrendChart.vue';

const props = defineProps({ rows: { type: Array, required: true } });

const el = ref(null);
const seen = ref(false);
useIntersectionObserver(el, ([e]) => { if (e.isIntersecting) seen.value = true; }, { threshold: 0.35 });
const reveal = useTween(computed(() => (seen.value ? 1 : 0)), 1800);

const overall = computed(() => rateByMonth(props.rows));
const total = computed(() => {
  const d = props.rows.reduce((s, r) => s + r.discharges, 0);
  const r = props.rows.reduce((s, r) => s + r.readmissions, 0);
  return r / d;
});
const headlineRate = computed(() => `${(total.value * 100).toFixed(1)}%`);
const series = computed(() => [
  { id: 'overall', label: 'All conditions', short: 'All conditions', tone: 'teal', values: overall.value },
]);
const summary = computed(() => {
  const o = overall.value;
  const lo = Math.min(...o.map((p) => p.rate));
  const hi = Math.max(...o.map((p) => p.rate));
  return `Line chart of the overall 30-day readmission rate across ${o.length} months. It stays between ${(lo * 100).toFixed(1)}% and ${(hi * 100).toFixed(1)}%, averaging ${headlineRate.value}.`;
});
</script>

<template>
  <section ref="el" class="beat" aria-labelledby="b1-title">
    <div class="text">
      <p class="kicker">30-day readmissions</p>
      <h1 id="b1-title">Readmissions held steady at {{ headlineRate }}. Good news?</h1>
      <p class="lede">On paper, nothing's wrong. Look closer.</p>
    </div>
    <TrendChart
      :series="series"
      :reveal="reveal"
      title="Overall readmission rate by month"
      :summary="summary"
    />
    <p class="scroll-cue" aria-hidden="true">Scroll ↓</p>
  </section>
</template>

<style scoped>
.beat {
  min-height: 100vh; display: flex; flex-direction: column; justify-content: center;
  gap: var(--space-4); padding: var(--space-6) var(--gutter);
  max-width: calc(var(--chart-max) + 2 * var(--gutter)); margin: 0 auto;
}
.text { max-width: var(--measure); }
.kicker { font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-teal); font-weight: 600; margin-bottom: var(--space-2); }
h1 { font-size: var(--text-xl); }
.lede { font-size: var(--text-lg); color: var(--color-ink-muted); }
.scroll-cue { color: var(--color-ink-muted); font-size: var(--text-sm); }
</style>
