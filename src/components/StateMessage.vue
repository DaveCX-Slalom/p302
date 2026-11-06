<script setup>
defineProps({
  kind: { type: String, required: true }, // loading | error | empty
  message: { type: String, default: '' },
});
defineEmits(['action']);
</script>

<template>
  <div class="state" :class="kind" :role="kind === 'error' ? 'alert' : 'status'">
    <template v-if="kind === 'loading'">
      <span class="spinner" aria-hidden="true"></span>
      <p>Loading the data…</p>
    </template>
    <template v-else-if="kind === 'error'">
      <p><strong>We couldn't load the data.</strong> {{ message }}</p>
      <button type="button" @click="$emit('action')">Try again</button>
    </template>
    <template v-else>
      <p>{{ message }}</p>
      <button type="button" @click="$emit('action')">Show all conditions</button>
    </template>
  </div>
</template>

<style scoped>
.state {
  display: grid; place-items: center; gap: var(--space-2); text-align: center;
  min-height: 16rem; width: 100%; max-width: var(--chart-max);
  padding: var(--space-4); border: 1px dashed var(--color-grey-line);
  border-radius: var(--radius); color: var(--color-ink-muted);
}
.state.error { border-color: var(--color-coral); }
button {
  font: inherit; padding: var(--space-2) var(--space-3); min-height: 44px;
  background: var(--color-teal); color: var(--color-surface);
  border: 0; border-radius: var(--radius); cursor: pointer;
}
.spinner {
  width: 1.5rem; height: 1.5rem; border-radius: 50%;
  border: 3px solid var(--color-teal-tint); border-top-color: var(--color-teal);
  animation: spin 900ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
