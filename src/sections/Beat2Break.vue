<script setup>
import { computed, ref } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import { CONDITIONS, rateByMonth } from '../composables/useReadmissions.js';
import { useConditionFilter } from '../composables/useConditionFilter.js';
import { useTween } from '../composables/useTween.js';
import TrendChart from '../components/TrendChart.vue';
import ConditionChips from '../components/ConditionChips.vue';
import StateMessage from '../components/StateMessage.vue';

const props = defineProps({ rows: { type: Array, required: true } });
const SHORT = { hip_knee: 'Hip/knee' };

const el = ref(null);
const seen = ref(false);
useIntersectionObserver(el, ([e]) => { if (e.isIntersecting) seen.value = true; }, { threshold: 0.4 });
const split = useTween(computed(() => (seen.value ? 1 : 0)), 1600);

const { selected, isEmpty, reset } = useConditionFilter();

const overall = computed(() => rateByMonth(props.rows));
const byCondition = computed(() =>
  CONDITIONS.map((c) => ({ ...c, values: rateByMonth(props.rows, [c.id]) })),
);

// The lines start on the overall average and separate as `split` goes 0 -> 1.
const series = computed(() =>
  byCondition.value
    .filter((c) => selected.value.has(c.id))
    .map((c) => ({
      id: c.id,
      label: c.label,
      short: SHORT[c.id],
      tone: c.problem ? 'coral' : 'grey',
      values: c.values.map((p, i) => ({
        month: p.month,
        actual: p.rate, // readout and end labels show the true value even mid-animation
        rate: overall.value[i].rate + (p.rate - overall.value[i].rate) * split.value,
      })),
    })),
);

const pct = (v) => `${(v * 100).toFixed(1)}%`;
const first = (id) => byCondition.value.find((c) => c.id === id).values[0].rate;
const last = (id) => { const v = byCondition.value.find((c) => c.id === id).values; return v[v.length - 1].rate; };
const rise = (id) => `+${((last(id) - first(id)) * 100).toFixed(1)} pts`;
const summary = computed(
  () =>
    `Line chart of the readmission rate for each condition. Heart failure rose from ${pct(first('heart_failure'))} to ${pct(last('heart_failure'))} and COPD from ${pct(first('copd'))} to ${pct(last('copd'))}. The other four conditions fell, which hides the rise in the overall average.`,
);
</script>

<template>
  <section id="conditions" ref="el" class="beat alt" aria-labelledby="b2-title">
    <div class="beat-inner">
      <div class="beat-text">
        <p class="kicker">2 of 6 · Break it apart</p>
        <h2 id="b2-title">The average is hiding two rising problems.</h2>
        <p>
          Split the line by condition. Heart failure ({{ rise('heart_failure') }}) and COPD ({{ rise('copd') }})
          are climbing. The other four are improving, and that offsets the rise.
        </p>
        <p class="callout">Improvements elsewhere are masking the rise.</p>
      </div>
      <div class="beat-stage">
        <ConditionChips />
        <StateMessage
          v-if="isEmpty"
          kind="empty"
          message="No conditions selected. Pick at least one to see its trend."
          @action="reset"
        />
        <TrendChart v-else :series="series" title="Readmission rate by condition" :summary="summary" />
      </div>
    </div>
  </section>
</template>
