<script setup>
import { computed, ref, watch } from 'vue';
import { useElementSize } from '@vueuse/core';
import { scaleLinear, line } from 'd3';

// series: [{ id, label, tone: 'teal' | 'coral' | 'grey', values: [{ month, rate }] }]
const props = defineProps({
  series: { type: Array, required: true },
  title: { type: String, required: true },
  summary: { type: String, required: true }, // text alternative
  yMax: { type: Number, default: 0.24 },
  reveal: { type: Number, default: 1 }, // 0..1 left-to-right reveal
  // Notes drawn on the chart: [{ id, i, rate, lines: string[], dx, dy, tone }]
  // `i` is the month index and `rate` the value the leader line points at.
  // Hidden on narrow screens, where the same point is made in the text beside the chart.
  annotations: { type: Array, default: () => [] },
});

const wrap = ref(null);
const { width } = useElementSize(wrap);
const w = computed(() => Math.max(280, width.value || 640));
const compact = computed(() => w.value < 520);
const h = computed(() => (compact.value ? 300 : 400));
const margin = computed(() => ({
  top: 16,
  right: compact.value ? 92 : 172,
  bottom: 32,
  left: 40,
}));
const innerW = computed(() => w.value - margin.value.left - margin.value.right);
const innerH = computed(() => h.value - margin.value.top - margin.value.bottom);

const months = computed(() => props.series[0]?.values.map((v) => v.month) ?? []);
const x = computed(() => scaleLinear([0, Math.max(1, months.value.length - 1)], [0, innerW.value]));
const y = computed(() => scaleLinear([0, props.yMax], [innerH.value, 0]));

const path = computed(() =>
  line()
    .x((_, i) => x.value(i))
    .y((d) => y.value(d.rate)),
);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtMonth(m) {
  const [yr, mo] = m.split('-');
  return `${MONTH_NAMES[+mo - 1]} ${yr}`;
}
const pct = (v) => `${(v * 100).toFixed(1)}%`;

const xTicks = computed(() => {
  const lastI = months.value.length - 1;
  const idx = months.value.map((_, i) => i).filter((i) => i % 6 === 0);
  // Add the final month only when there is room for its label.
  if (!compact.value && lastI - idx[idx.length - 1] >= 4) idx.push(lastI);
  return idx.map((i) => ({
    i,
    label: compact.value ? fmtMonth(months.value[i]).replace(/ 20/, " '") : fmtMonth(months.value[i]),
  }));
});
const yTicks = computed(() => {
  const step = props.yMax > 0.15 ? 0.05 : 0.02;
  const out = [];
  for (let v = 0; v <= props.yMax + 1e-9; v += step) out.push(v);
  return out;
});

// Direct end labels, nudged apart so they never overlap.
const labels = computed(() => {
  const gap = compact.value ? 13 : 16;
  const items = props.series
    .map((s) => {
      const end = s.values[s.values.length - 1];
      const name = s.short ?? s.label;
      // Show the final value next to the name when there is room for it.
      return { id: s.id, tone: s.tone, text: compact.value ? name : `${name} ${pct(end.actual ?? end.rate)}`, y: y.value(end.rate) };
    })
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < items.length; i++) {
    if (items[i].y - items[i - 1].y < gap) items[i].y = items[i - 1].y + gap;
  }
  return items;
});

// Keyboard and pointer readout.
const active = ref(null);
watch(months, () => (active.value = null));
function onKey(e) {
  const last = months.value.length - 1;
  if (e.key === 'ArrowRight') active.value = Math.min(last, (active.value ?? -1) + 1);
  else if (e.key === 'ArrowLeft') active.value = Math.max(0, (active.value ?? last + 1) - 1);
  else if (e.key === 'Home') active.value = 0;
  else if (e.key === 'End') active.value = last;
  else if (e.key === 'Escape') active.value = null;
  else return;
  e.preventDefault();
}
function onPointer(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const px = e.clientX - rect.left - margin.value.left;
  const i = Math.round(x.value.invert(px));
  active.value = Math.max(0, Math.min(months.value.length - 1, i));
}
const readout = computed(() => {
  if (active.value === null) return null;
  const i = active.value;
  return {
    month: fmtMonth(months.value[i]),
    items: props.series.map((s) => ({ id: s.id, label: s.label, tone: s.tone, value: pct(s.values[i].actual ?? s.values[i].rate) })),
  };
});
const clipId = `clip-${Math.random().toString(36).slice(2, 8)}`;

const LINE_H = 16;
const notes = computed(() =>
  compact.value
    ? []
    : props.annotations.map((a) => {
        const px = x.value(a.i);
        const py = y.value(a.rate);
        const tx = px + (a.dx ?? 0);
        const above = (a.dy ?? 0) < 0;
        // Text block sits at (tx, ty); the leader meets its nearest edge.
        const ty = py + (a.dy ?? 0) - (above ? (a.lines.length - 1) * LINE_H : 0);
        const leaderEnd = above ? ty + (a.lines.length - 1) * LINE_H + 6 : ty - 14;
        return { ...a, px, py, tx, ty, leaderEnd };
      }),
);
</script>

<template>
  <figure class="chart" ref="wrap">
    <svg
      :width="w"
      :height="h"
      :viewBox="`0 0 ${w} ${h}`"
      tabindex="0"
      role="group"
      :aria-label="`${title}. Use left and right arrow keys to read each month.`"
      @keydown="onKey"
      @pointermove="onPointer"
      @pointerdown="onPointer"
      @pointerleave="active = null"
      @blur="active = null"
    >
      <defs>
        <clipPath :id="clipId">
          <rect :x="-2" :y="-8" :width="(innerW + 4) * reveal" :height="innerH + 16" />
        </clipPath>
      </defs>
      <g :transform="`translate(${margin.left},${margin.top})`">
        <g class="grid" aria-hidden="true">
          <g v-for="t in yTicks" :key="t" :transform="`translate(0,${y(t)})`">
            <line :x2="innerW" />
            <text x="-8" dy="0.32em" text-anchor="end">{{ Math.round(t * 100) }}%</text>
          </g>
          <text v-for="t in xTicks" :key="t.i" :x="x(t.i)" :y="innerH + 22" text-anchor="middle">{{ t.label }}</text>
        </g>

        <g :clip-path="`url(#${clipId})`">
          <path
            v-for="s in series"
            :key="s.id"
            :d="path(s.values)"
            :class="['line', s.tone]"
            fill="none"
          />
        </g>

        <g v-if="reveal > 0.98" aria-hidden="true">
          <text
            v-for="l in labels"
            :key="l.id"
            :x="innerW + 8"
            :y="l.y"
            dy="0.32em"
            :class="['end-label', l.tone]"
          >{{ l.text }}</text>
        </g>

        <g v-if="reveal > 0.98 && notes.length" aria-hidden="true">
          <g v-for="a in notes" :key="a.id">
            <line :class="['leader', a.tone]" :x1="a.px" :y1="a.py" :x2="a.tx" :y2="a.leaderEnd" />
            <circle :class="['leader-dot', a.tone]" :cx="a.px" :cy="a.py" r="3.5" />
            <text :class="['note', a.tone]" :x="a.tx" :y="a.ty">
              <tspan v-for="(l, n) in a.lines" :key="n" :x="a.tx" :dy="n ? LINE_H : 0">{{ l }}</tspan>
            </text>
          </g>
        </g>

        <g v-if="active !== null" aria-hidden="true">
          <line class="cursor" :x1="x(active)" :x2="x(active)" y1="0" :y2="innerH" />
          <circle
            v-for="s in series"
            :key="s.id"
            :cx="x(active)"
            :cy="y(s.values[active].rate)"
            r="4"
            :class="['dot', s.tone]"
          />
        </g>
      </g>
    </svg>

    <div class="readout" aria-live="polite">
      <template v-if="readout">
        <strong>{{ readout.month }}</strong>
        <span v-for="i in readout.items" :key="i.id" :class="['chip-val', i.tone]">{{ i.label }} {{ i.value }}</span>
      </template>
      <span v-else class="hint">Hover, tap, or use the arrow keys to read a month.</span>
    </div>
    <figcaption class="sr-only">{{ summary }}</figcaption>
  </figure>
</template>

<style scoped>
.chart { margin: 0; width: 100%; max-width: var(--chart-max); }
svg { display: block; max-width: 100%; touch-action: pan-y; border-radius: var(--radius); }
svg:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
.grid line { stroke: var(--color-grey-line); stroke-width: 1; }
.grid text { fill: var(--color-ink-muted); font-size: 12px; font-family: var(--font-sans); }
.line { stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round; }
.line.teal { stroke: var(--color-teal); stroke-width: 3.5; }
.line.coral { stroke: var(--color-coral); stroke-width: 3.5; }
.line.grey { stroke: var(--color-grey-mark); }
.end-label { font-size: 13px; font-family: var(--font-sans); font-weight: 600; }
.end-label.teal { fill: var(--color-teal); }
.end-label.coral { fill: var(--color-coral); }
.end-label.grey { fill: var(--color-ink-muted); font-weight: 500; }
.note {
  font-size: 13px; font-family: var(--font-sans); font-weight: 600; fill: var(--color-ink);
  /* A halo in the section background keeps text readable over gridlines. */
  paint-order: stroke; stroke: var(--chart-halo, var(--color-bg)); stroke-width: 5px; stroke-linejoin: round;
}
.note.coral { fill: var(--color-coral); }
.leader { stroke: var(--color-ink-muted); stroke-width: 1.5; }
.leader.coral { stroke: var(--color-coral); }
.leader-dot { fill: var(--color-ink-muted); }
.leader-dot.coral { fill: var(--color-coral); }
.cursor { stroke: var(--color-ink-muted); stroke-dasharray: 3 3; }
.dot { stroke: var(--color-surface); stroke-width: 2; }
.dot.teal { fill: var(--color-teal); }
.dot.coral { fill: var(--color-coral); }
.dot.grey { fill: var(--color-grey-mark); }
.readout {
  display: flex; flex-wrap: wrap; gap: var(--space-1) var(--space-3);
  min-height: 3.2rem; padding-top: var(--space-2);
  font-size: var(--text-sm); color: var(--color-ink-muted);
}
.readout strong { color: var(--color-ink); }
.chip-val.coral { color: var(--color-coral); font-weight: 600; }
.chip-val.teal { color: var(--color-teal); font-weight: 600; }
.hint { font-style: italic; }
@media (max-width: 519px) { .end-label { font-size: 11px; } }
</style>
