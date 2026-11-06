<script setup>
import { CONDITIONS } from '../composables/useReadmissions.js';
import { useConditionFilter } from '../composables/useConditionFilter.js';

const { selected, toggle } = useConditionFilter();
</script>

<template>
  <div class="chips" role="group" aria-label="Show or hide conditions">
    <button
      v-for="c in CONDITIONS"
      :key="c.id"
      type="button"
      :class="['chip', { on: selected.has(c.id), problem: c.problem }]"
      :aria-pressed="selected.has(c.id)"
      @click="toggle(c.id)"
    >{{ c.label }}</button>
  </div>
</template>

<style scoped>
.chips { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3); }
.chip {
  font: inherit; font-size: var(--text-sm); min-height: 44px; padding: 0 var(--space-3);
  border: 1.5px solid var(--color-grey-mark); border-radius: 999px;
  background: var(--color-surface); color: var(--color-ink-muted); cursor: pointer;
}
.chip.on { background: var(--color-teal-tint); border-color: var(--color-teal); color: var(--color-teal); font-weight: 600; }
.chip.on.problem { background: var(--color-coral-tint); border-color: var(--color-coral); color: var(--color-coral); }
</style>
