<script setup>
import { ref, onMounted } from 'vue';
import { useEventListener } from '@vueuse/core';

// Sticky header: fictional brand, jump links to each beat, scroll progress.
const ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'conditions', label: 'Conditions' },
  { id: 'shifts', label: 'Shifts' },
  { id: 'staffing', label: 'Staffing' },
  { id: 'what-if', label: 'What if' },
  { id: 'next-steps', label: 'Next steps' },
];

const active = ref('');
const progress = ref(0);

function update() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  progress.value = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  const line = window.innerHeight * 0.4;
  let current = '';
  for (const it of ITEMS) {
    const el = document.getElementById(it.id);
    if (el && el.getBoundingClientRect().top <= line) current = it.id;
  }
  active.value = current;
}
onMounted(update);
useEventListener(window, 'scroll', update, { passive: true });
useEventListener(window, 'resize', update, { passive: true });
</script>

<template>
  <header class="site-header">
    <div class="bar">
      <a class="brand" href="#top" aria-label="Northfield General Hospital (fictional), back to the top">
        <svg class="logo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <rect width="32" height="32" rx="8" class="logo-bg" />
          <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" class="logo-mark" />
        </svg>
        <span class="name">Northfield General</span>
        <span class="tag">Fictional</span>
      </a>
      <nav aria-label="Story sections">
        <ol>
          <li v-for="(it, i) in ITEMS" :key="it.id">
            <a :href="`#${it.id}`" :aria-current="active === it.id ? 'location' : undefined" :class="{ on: active === it.id }">
              <span class="num" aria-hidden="true">{{ i + 1 }}</span>{{ it.label }}
            </a>
          </li>
        </ol>
      </nav>
    </div>
    <div class="progress" aria-hidden="true"><span :style="{ transform: `scaleX(${progress})` }"></span></div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky; top: 0; z-index: 20;
  background: color-mix(in srgb, var(--color-bg) 94%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-grey-line);
}
.bar {
  max-width: 76rem; margin: 0 auto; padding: var(--space-2) var(--gutter);
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-1) var(--space-4);
}
.brand { display: flex; align-items: center; gap: var(--space-2); color: var(--color-ink); text-decoration: none; min-height: 44px; }
.logo { width: 28px; height: 28px; }
.logo-bg { fill: var(--color-teal); }
.logo-mark { fill: var(--color-surface); }
.name { font-family: var(--font-serif); font-weight: 600; font-size: 1.05rem; }
.tag {
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;
  padding: 2px 8px; border-radius: 999px; background: var(--color-teal-tint); color: var(--color-teal);
}
nav { min-width: 0; max-width: 100%; }
ol { list-style: none; margin: 0; padding: 0; display: flex; gap: var(--space-1); overflow-x: auto; scrollbar-width: none; }
ol::-webkit-scrollbar { display: none; }
nav a {
  display: flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 var(--space-2);
  white-space: nowrap; font-size: var(--text-sm); color: var(--color-ink-muted); text-decoration: none;
  border-bottom: 3px solid transparent;
}
nav a:hover { color: var(--color-ink); }
nav a.on { color: var(--color-teal); font-weight: 700; border-bottom-color: var(--color-teal); }
.num {
  display: inline-grid; place-items: center; width: 1.3rem; height: 1.3rem; border-radius: 50%;
  font-size: 0.72rem; border: 1.5px solid currentColor;
}
.progress { height: 3px; background: transparent; }
.progress span { display: block; height: 100%; background: var(--color-teal); transform-origin: left; }
@media (max-width: 767px) {
  .bar { padding-top: var(--space-1); padding-bottom: 0; }
  .name { font-size: 1rem; }
  .num { display: none; }
  nav { width: 100%; }
  /* Fade the right edge to hint that the links scroll sideways. */
  ol { -webkit-mask-image: linear-gradient(to right, #000 88%, transparent); mask-image: linear-gradient(to right, #000 88%, transparent); }
}
</style>
