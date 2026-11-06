<script setup>
import { computed, ref } from 'vue';
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
const range = computed(() => {
  const r = overall.value.map((p) => p.rate);
  return `${(Math.min(...r) * 100).toFixed(1)}% and ${(Math.max(...r) * 100).toFixed(1)}%`;
});
const annotations = computed(() => {
  const i = 3;
  return [{
    id: 'flat', i, rate: overall.value[i].rate, dx: -8, dy: -62, tone: 'teal',
    lines: ['Flat for two years:', `never below ${(Math.min(...overall.value.map((p) => p.rate)) * 100).toFixed(1)}%,`, `never above ${(Math.max(...overall.value.map((p) => p.rate)) * 100).toFixed(1)}%`],
  }];
});
const summary = computed(
  () => `Line chart of the overall 30-day readmission rate across ${overall.value.length} months. It stays between ${range.value}, averaging ${headlineRate.value}.`,
);
</script>

<template>
  <section id="overview" ref="el" class="beat" aria-labelledby="b1-title">
    <div class="beat-inner">
      <div class="beat-text">
        <p class="kicker">1 of 6 · The headline</p>
        <h2 id="b1-title">Readmissions held steady at {{ headlineRate }}. Good news?</h2>
        <p class="lede">On paper, nothing's wrong. Look closer.</p>
        <p class="note">Every month for two years sat between {{ range }}. No alarm bells.</p>
      </div>
      <div class="beat-stage">
        <TrendChart :series="series" :reveal="reveal" :annotations="annotations" title="Overall readmission rate by month" :summary="summary" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.lede { font-size: var(--text-lg); color: var(--color-ink-muted); }
</style>
