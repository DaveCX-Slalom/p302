<script setup>
import { computed, ref, watch } from 'vue';
import { useElementSize } from '@vueuse/core';
import { scaleLinear } from 'd3';

// points: [{ id, x, y, tone: 'coral' | 'teal', desc }]
const props = defineProps({
  points: { type: Array, required: true },
  trend: { type: Object, default: null }, // { slope, intercept }
  clusters: { type: Array, default: () => [] }, // [{ text, tone, x, y }] direct labels in data units
  title: { type: String, required: true },
  summary: { type: String, required: true },
  xLabel: { type: String, required: true },
  xLabelShort: { type: String, default: '' }, // used on narrow screens
  yLabel: { type: String, required: true },
  reveal: { type: Number, default: 1 },
});

const wrap = ref(null);
const { width } = useElementSize(wrap);
const w = computed(() => Math.max(280, width.value || 640));
const compact = computed(() => w.value < 520);
const h = computed(() => (compact.value ? 340 : 420));
const m = computed(() => ({ top: 16, right: 16, bottom: 52, left: compact.value ? 58 : 60 }));
const innerW = computed(() => w.value - m.value.left - m.value.right);
const innerH = computed(() => h.value - m.value.top - m.value.bottom);

const xs = computed(() => props.points.map((p) => p.x));
const ys = computed(() => props.points.map((p) => p.y));
const x = computed(() => scaleLinear([Math.floor(Math.min(...xs.value, 4) - 0.5), Math.ceil(Math.max(...xs.value, 8) + 0.5)], [0, innerW.value]).nice());
const y = computed(() => scaleLinear([0, Math.ceil(Math.max(...ys.value, 0.2) * 20) / 20], [innerH.value, 0]).nice());
const xTicks = computed(() => x.value.ticks(compact.value ? 4 : 7));
const yTicks = computed(() => y.value.ticks(5));

const trendLine = computed(() => {
  if (!props.trend || !props.points.length) return null;
  const [x0, x1] = [Math.min(...xs.value), Math.max(...xs.value)];
  const f = (v) => props.trend.intercept + props.trend.slope * v;
  return { x1: x.value(x0), y1: y.value(f(x0)), x2: x.value(x1), y2: y.value(f(x1)) };
});

// Keyboard and pointer: step through points ordered by x.
const ordered = computed(() => [...props.points].sort((a, b) => a.x - b.x || a.y - b.y));
const active = ref(null);
watch(() => props.points, () => (active.value = null));
function onKey(e) {
  const last = ordered.value.length - 1;
  if (last < 0) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') active.value = Math.min(last, (active.value ?? -1) + 1);
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') active.value = Math.max(0, (active.value ?? last + 1) - 1);
  else if (e.key === 'Home') active.value = 0;
  else if (e.key === 'End') active.value = last;
  else if (e.key === 'Escape') active.value = null;
  else return;
  e.preventDefault();
}
function onPointer(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const px = e.clientX - rect.left - m.value.left;
  const py = e.clientY - rect.top - m.value.top;
  let best = null, bestD = 28 * 28;
  ordered.value.forEach((p, i) => {
    const d = (x.value(p.x) - px) ** 2 + (y.value(p.y) - py) ** 2;
    if (d < bestD) { bestD = d; best = i; }
  });
  active.value = best;
}
const activePoint = computed(() => (active.value === null ? null : ordered.value[active.value]));
</script>

<template>
  <figure class="chart" ref="wrap">
    <svg
      :width="w" :height="h" :viewBox="`0 0 ${w} ${h}`" tabindex="0" role="group"
      :aria-label="`${title}. Use the arrow keys to step through points from thinnest to richest staffing.`"
      @keydown="onKey" @pointermove="onPointer" @pointerdown="onPointer"
      @pointerleave="active = null" @blur="active = null"
    >
      <g :transform="`translate(${m.left},${m.top})`">
        <g class="grid" aria-hidden="true">
          <g v-for="t in yTicks" :key="`y${t}`" :transform="`translate(0,${y(t)})`">
            <line :x2="innerW" />
            <text x="-8" dy="0.32em" text-anchor="end">{{ Math.round(t * 100) }}%</text>
          </g>
          <g v-for="t in xTicks" :key="`x${t}`" :transform="`translate(${x(t)},${innerH})`">
            <line y2="6" />
            <text y="20" text-anchor="middle">{{ t }}</text>
          </g>
          <text class="axis-title" :x="innerW / 2" :y="innerH + 44" text-anchor="middle">{{ compact && xLabelShort ? xLabelShort : xLabel }}</text>
          <text class="axis-title" :transform="`translate(${-m.left + 12},${innerH / 2}) rotate(-90)`" text-anchor="middle">{{ yLabel }}</text>
        </g>

        <g :opacity="reveal">
          <circle
            v-for="p in points" :key="p.id"
            :cx="x(p.x)" :cy="y(p.y)" r="4.5" :class="['pt', p.tone]"
          />
        </g>
        <line v-if="trendLine && reveal > 0.98" class="trend" :x1="trendLine.x1" :y1="trendLine.y1" :x2="trendLine.x2" :y2="trendLine.y2" />
        <g v-if="reveal > 0.98" aria-hidden="true">
          <text v-for="c in clusters" :key="c.text" :x="x(c.x)" :y="y(c.y)" text-anchor="middle" :class="['cluster', c.tone]">{{ c.text }}</text>
        </g>
        <circle v-if="activePoint" class="ring" :cx="x(activePoint.x)" :cy="y(activePoint.y)" r="9" />
      </g>
    </svg>
    <div class="readout" aria-live="polite">
      <strong v-if="activePoint">{{ activePoint.desc }}</strong>
      <span v-else class="hint">Hover, tap, or use the arrow keys to read a point.</span>
    </div>
    <figcaption class="sr-only">{{ summary }}</figcaption>
  </figure>
</template>

<style scoped>
.chart { margin: 0; width: 100%; max-width: var(--chart-max); }
svg { display: block; max-width: 100%; touch-action: pan-y; border-radius: var(--radius); }
.grid line { stroke: var(--color-grey-line); }
.grid text { fill: var(--color-ink-muted); font-size: 12px; font-family: var(--font-sans); }
.grid .axis-title { font-size: 13px; fill: var(--color-ink); }
.pt { fill-opacity: 0.7; stroke: var(--color-surface); stroke-width: 1; }
.pt.coral { fill: var(--color-coral); }
.pt.teal { fill: var(--color-teal); }
.trend { stroke: var(--color-ink); stroke-width: 2; stroke-dasharray: 6 4; }
.cluster { font-size: 13px; font-weight: 700; font-family: var(--font-sans); }
.cluster.coral { fill: var(--color-coral); }
.cluster.teal { fill: var(--color-teal); }
.ring { fill: none; stroke: var(--color-ink); stroke-width: 2; }
.readout { min-height: 3.2rem; padding-top: var(--space-2); font-size: var(--text-sm); color: var(--color-ink-muted); }
.readout strong { color: var(--color-ink); font-weight: 600; }
.hint { font-style: italic; }
</style>
