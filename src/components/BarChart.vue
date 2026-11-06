<script setup>
import { computed, ref } from 'vue';
import { useElementSize } from '@vueuse/core';
import { scaleBand, scaleLinear } from 'd3';

// groups: [{ id, label, bars: [{ id, lines: string[], label, value, tone: 'coral' | 'teal' }] }]
const props = defineProps({
  groups: { type: Array, required: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  yMax: { type: Number, default: 0.35 },
  reveal: { type: Number, default: 1 },
});

const wrap = ref(null);
const { width } = useElementSize(wrap);
const w = computed(() => Math.max(280, width.value || 640));
const compact = computed(() => w.value < 520);
const h = computed(() => (compact.value ? 320 : 400));
const m = { top: 28, right: 12, bottom: 78, left: 40 };
const innerW = computed(() => w.value - m.left - m.right);
const innerH = computed(() => h.value - m.top - m.bottom);

const x0 = computed(() => scaleBand(props.groups.map((g) => g.id), [0, innerW.value]).paddingInner(compact.value ? 0.1 : 0.18).paddingOuter(0.06));
const x1 = computed(() => scaleBand(props.groups[0]?.bars.map((b) => b.id) ?? [], [0, x0.value.bandwidth()]).padding(compact.value ? 0.04 : 0.12));
const y = computed(() => scaleLinear([0, props.yMax], [innerH.value, 0]));
const yTicks = computed(() => {
  const out = [];
  for (let v = 0; v <= props.yMax + 1e-9; v += 0.1) out.push(v);
  return out;
});
const pct = (v) => `${(v * 100).toFixed(1)}%`;
</script>

<template>
  <figure class="chart" ref="wrap">
    <svg :width="w" :height="h" :viewBox="`0 0 ${w} ${h}`" role="img" :aria-label="title">
      <g :transform="`translate(${m.left},${m.top})`">
        <g class="grid" aria-hidden="true">
          <g v-for="t in yTicks" :key="t" :transform="`translate(0,${y(t)})`">
            <line :x2="innerW" />
            <text x="-8" dy="0.32em" text-anchor="end">{{ Math.round(t * 100) }}%</text>
          </g>
        </g>
        <g v-for="g in groups" :key="g.id" :transform="`translate(${x0(g.id)},0)`">
          <g v-for="b in g.bars" :key="b.id" :transform="`translate(${x1(b.id)},0)`">
            <rect
              :class="['bar', b.tone]"
              :x="0"
              :width="x1.bandwidth()"
              :y="y(b.value * reveal)"
              :height="innerH - y(b.value * reveal)"
              rx="2"
            />
            <text v-if="reveal > 0.98" :class="['val', b.tone]" :x="x1.bandwidth() / 2" :y="y(b.value) - 6" text-anchor="middle">{{ pct(b.value) }}</text>
            <text class="shift" :x="x1.bandwidth() / 2" :y="innerH + 18" text-anchor="middle">
              <tspan v-for="(l, i) in (compact && b.short ? b.short : b.lines)" :key="i" :x="x1.bandwidth() / 2" :dy="i ? '1.1em' : 0">{{ l }}</tspan>
            </text>
          </g>
          <text class="group" :x="x0.bandwidth() / 2" :y="innerH + 62" text-anchor="middle">{{ g.label }}</text>
        </g>
      </g>
    </svg>
    <figcaption class="sr-only">{{ summary }}</figcaption>
    <div class="sr-only">
    <table>
      <caption>{{ title }}</caption>
      <thead><tr><th>Condition</th><th>Shift</th><th>Readmission rate</th></tr></thead>
      <tbody>
        <template v-for="g in groups" :key="g.id">
          <tr v-for="b in g.bars" :key="b.id"><td>{{ g.label }}</td><td>{{ b.label }}</td><td>{{ pct(b.value) }}</td></tr>
        </template>
      </tbody>
    </table>
    </div>
  </figure>
</template>

<style scoped>
.chart { margin: 0; width: 100%; max-width: var(--chart-max); }
svg { display: block; max-width: 100%; }
.grid line { stroke: var(--color-grey-line); }
.grid text { fill: var(--color-ink-muted); font-size: 12px; font-family: var(--font-sans); }
.bar.coral { fill: var(--color-coral); }
.bar.teal { fill: var(--color-teal-soft); }
.val { font-size: 13px; font-weight: 700; font-family: var(--font-sans); }
.val.coral { fill: var(--color-coral); }
.val.teal { fill: var(--color-ink-muted); }
.shift { fill: var(--color-ink-muted); font-size: 12px; font-family: var(--font-sans); }
.group { fill: var(--color-ink); font-size: 14px; font-weight: 600; font-family: var(--font-sans); }
@media (max-width: 519px) { .shift { font-size: 10px; } .val { font-size: 12px; } }
</style>
