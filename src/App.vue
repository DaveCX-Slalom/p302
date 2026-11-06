<script setup>
import { useReadmissions } from './composables/useReadmissions.js';
import SiteNav from './components/SiteNav.vue';
import IntroHero from './components/IntroHero.vue';
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
  <SiteNav />
  <main id="story">
    <div v-if="status !== 'ready'" class="gate">
      <StateMessage v-if="status === 'error'" kind="error" :message="error" @action="retry" />
      <StateMessage v-else kind="loading" />
    </div>
    <template v-else>
      <IntroHero :rows="rows" />
      <Beat1Hook :rows="rows" />
      <Beat2Break :rows="rows" />
      <Beat3Where :rows="rows" />
      <Beat4Why :rows="rows" />
      <Beat5WhatIf :rows="rows" />
      <Beat6Takeaway :rows="rows" />
    </template>
  </main>
  <footer>
    <div class="inner">
      <p class="strong">Illustrative data.</p>
      <p>
        Northfield General Hospital is fictional and every number in this story is invented. It describes no real
        hospital, patient, or organization. Built with Vue and D3.
      </p>
      <a href="#top">Back to the top ↑</a>
    </div>
  </footer>
</template>

<style scoped>
.gate { min-height: 70vh; display: grid; place-items: center; padding: var(--gutter); }
.skip { position: absolute; left: -999px; top: 0; background: var(--color-teal); color: var(--color-surface); padding: var(--space-2) var(--space-3); z-index: 30; }
.skip:focus { left: var(--space-2); top: var(--space-2); }
footer { background: var(--color-teal-deep); color: var(--color-on-deep); }
footer .inner { max-width: 76rem; margin: 0 auto; padding: var(--space-5) var(--gutter); display: grid; gap: var(--space-2); font-size: var(--text-sm); }
footer p { margin: 0; max-width: 44rem; }
footer .strong { font-family: var(--font-serif); font-size: var(--text-lg); font-weight: 600; color: var(--color-surface); }
footer a { color: var(--color-surface); min-height: 44px; display: inline-flex; align-items: center; width: fit-content; }
footer a:focus-visible { outline-color: var(--color-surface); }
</style>
