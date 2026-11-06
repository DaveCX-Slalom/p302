import { ref, computed } from 'vue';
import { CONDITIONS } from './useReadmissions.js';

// Shared across beats 2 to 4. All conditions are selected by default.
const selected = ref(new Set(CONDITIONS.map((c) => c.id)));

export function useConditionFilter() {
  function toggle(id) {
    const next = new Set(selected.value);
    next.has(id) ? next.delete(id) : next.add(id);
    selected.value = next;
  }
  function reset() {
    selected.value = new Set(CONDITIONS.map((c) => c.id));
  }
  return {
    selected,
    toggle,
    reset,
    isEmpty: computed(() => selected.value.size === 0),
  };
}
