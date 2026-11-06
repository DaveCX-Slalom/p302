import { ref, readonly } from 'vue';

export const CONDITIONS = [
  { id: 'heart_failure', label: 'Heart failure', problem: true },
  { id: 'copd', label: 'COPD', problem: true },
  { id: 'pneumonia', label: 'Pneumonia', problem: false },
  { id: 'hip_knee', label: 'Hip/knee replacement', problem: false },
  { id: 'diabetes', label: 'Diabetes', problem: false },
  { id: 'stroke', label: 'Stroke', problem: false },
];

const rows = ref([]);
const status = ref('idle'); // idle | loading | ready | error
const error = ref(null);
let promise = null;

export function loadData() {
  if (promise) return promise;
  status.value = 'loading';
  promise = fetch(`${import.meta.env.BASE_URL}readmissions.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`Data request failed (${res.status})`);
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data) || data.length === 0) throw new Error('Data file was empty');
      rows.value = data;
      status.value = 'ready';
    })
    .catch((e) => {
      error.value = e.message;
      status.value = 'error';
      promise = null; // allow retry
    });
  return promise;
}

export function useReadmissions() {
  if (status.value === 'idle') loadData();
  return { rows: readonly(rows), status: readonly(status), error: readonly(error), retry: loadData };
}

// Blended rate = sum(readmissions) / sum(discharges), grouped by month.
export function rateByMonth(data, conditionIds) {
  const set = conditionIds ? new Set(conditionIds) : null;
  const acc = new Map();
  for (const r of data) {
    if (set && !set.has(r.condition)) continue;
    const a = acc.get(r.month) || { d: 0, r: 0 };
    a.d += r.discharges;
    a.r += r.readmissions;
    acc.set(r.month, a);
  }
  return [...acc.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, a]) => ({ month, rate: a.r / a.d, discharges: a.d }));
}
