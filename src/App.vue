<script setup>
import { useReadmissions } from './composables/useReadmissions.js';
import Beat1Hook from './sections/Beat1Hook.vue';
import Beat2Break from './sections/Beat2Break.vue';
import Beat3Where from './sections/Beat3Where.vue';
import Beat4Why from './sections/Beat4Why.vue';
import Beat5WhatIf from './sections/Beat5WhatIf.vue';
import Beat6Takeaway from './sections/Beat6Takeaway.vue';
import StateMessage from './components/StateMessage.vue';

const { rows, status, error, retry } = useReadmissions();
</script>

<template>
  <a class="skip" href="#story">Skip to the story</a>
  <main id="story">
    <div v-if="status !== 'ready'" class="gate">
      <StateMessage v-if="status === 'error'" kind="error" :message="error" @action="retry" />
      <StateMessage v-else kind="loading" />
    </div>
    <template v-else>
      <Beat1Hook :rows="rows" />
      <Beat2Break :rows="rows" />
      <Beat3Where :rows="rows" />
      <Beat4Why :rows="rows" />
      <Beat5WhatIf :rows="rows" />
      <Beat6Takeaway :rows="rows" />
    </template>
  </main>
  <footer>
    <p>Illustrative data. All numbers are invented for this story and describe no real hospital.</p>
  </footer>
</template>

<style scoped>
.gate { min-height: 100vh; display: grid; place-items: center; padding: var(--gutter); }
.skip { position: absolute; left: -999px; top: 0; background: var(--color-teal); color: var(--color-surface); padding: var(--space-2) var(--space-3); z-index: 10; }
.skip:focus { left: var(--space-2); top: var(--space-2); }
footer { padding: var(--space-5) var(--gutter); text-align: center; color: var(--color-ink-muted); font-size: var(--text-sm); border-top: 1px solid var(--color-grey-line); }
footer p { margin: 0; }
</style>
