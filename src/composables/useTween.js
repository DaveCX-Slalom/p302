import { ref, watch, onBeforeUnmount } from 'vue';
import { useMediaQuery } from '@vueuse/core';

// Animate a number toward `target` (0..1). With prefers-reduced-motion it jumps.
export function useTween(target, duration = 1400) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const value = ref(reduced.value ? target.value : 0);
  let raf = 0;

  function run(to) {
    cancelAnimationFrame(raf);
    if (reduced.value) {
      value.value = to;
      return;
    }
    const from = value.value;
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      // rAF timestamps can precede t0 by a frame; clamp so easing never goes negative.
      const t = Math.min(1, Math.max(0, (now - t0) / duration));
      value.value = from + (to - from) * ease(t);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  watch(target, run);
  watch(reduced, () => run(target.value));
  onBeforeUnmount(() => cancelAnimationFrame(raf));
  return value;
}
