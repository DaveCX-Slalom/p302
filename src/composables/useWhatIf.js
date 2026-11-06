import { ref, computed } from 'vue';
import { regress } from './stats.js';

// Illustrative assumptions, stated on screen in beat 5.
export const BASELINE_WEEKEND_NURSES = 8;
export const COST_PER_READMISSION = 15000;
export const MAX_ADDED = 3;

const PROBLEM = new Set(['heart_failure', 'copd']);

// Shared so beat 6 can reuse the number the reader chose in beat 5.
const added = ref(1);

// Simple linear estimate (decision #7): one pooled slope of rate on nurse_ratio
// over HF + COPD rows. Scope is HF + COPD weekend discharges only.
export function projectWhatIf(rows, addedNurses) {
  const hc = rows.filter((r) => PROBLEM.has(r.condition));
  const fit = regress(hc, (r) => r.nurse_ratio, (r) => r.rate);
  const months = [...new Set(rows.map((r) => r.month))].sort();
  const last12 = new Set(months.slice(-12));
  const weekend = hc.filter((r) => r.shift === 'weekend' && last12.has(r.month));
  const weekday = hc.filter((r) => r.shift !== 'weekend' && last12.has(r.month));
  if (!fit || !weekend.length || !weekday.length) return null;

  const sum = (rs, f) => rs.reduce((s, r) => s + f(r), 0);
  const discharges = sum(weekend, (r) => r.discharges);
  const rate = sum(weekend, (r) => r.readmissions) / discharges;
  const weekdayRate = sum(weekday, (r) => r.readmissions) / sum(weekday, (r) => r.discharges);
  const ratio = sum(weekend, (r) => r.nurse_ratio * r.discharges) / discharges;

  // Patients per nurse falls as nurses are added: ratio * N / (N + k).
  const newRatio = (ratio * BASELINE_WEEKEND_NURSES) / (BASELINE_WEEKEND_NURSES + addedNurses);
  // Do not project below the weekday rate (stay inside the observed pattern).
  const projectedRate = Math.max(weekdayRate, rate + fit.slope * (newRatio - ratio));
  const readmissions = discharges * rate;
  const projected = discharges * projectedRate;
  const avoided = Math.max(0, readmissions - projected);
  return {
    slope: fit.slope,
    discharges, // weekend HF + COPD discharges, last 12 months
    rate, projectedRate, weekdayRate,
    ratio, newRatio,
    readmissions, projected, avoided,
    avoidedCost: avoided * COST_PER_READMISSION,
  };
}

export function useWhatIf(rows) {
  const model = computed(() => projectWhatIf(rows.value ?? rows, added.value));
  return { added, model };
}

export const money = (v) => (v < 500 ? '$0' : `$${Math.round(v / 1000).toLocaleString('en-US')}K`);
