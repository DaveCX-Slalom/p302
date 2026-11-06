// Seeded synthetic readmission data for "Why Do Patients Come Back?".
// ALL DATA IS INVENTED. No client, hospital, or Slalom information.
//
// Usage: node data/generate.js
// Writes data/readmissions.json and prints sanity checks.
// Exits non-zero if the planted story pattern is not present.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SEED = 2024;
const MONTHS = 24;
const START_YEAR = 2024;
const TARGET_BLENDED = 0.142;

const SHIFTS = ['weekday_day', 'weekday_evening', 'weekend'];
// Share of a condition's monthly discharges that happen on each shift.
const SHIFT_SHARE = { weekday_day: 0.5, weekday_evening: 0.3, weekend: 0.2 };
// Patients per discharge nurse (higher = thinner staffing). Weekend ~40% worse than weekday day.
const NURSE_BASE = { weekday_day: 5.0, weekday_evening: 5.4, weekend: 7.0 };

// vol: monthly discharges. start/end: condition rate at month 0 and month 23.
// `end: null` means "solved so the blended rate stays flat".
// weekend: readmission multiplier on weekend vs weekday day (HF/COPD ~2x).
const CONDITIONS = [
  { id: 'heart_failure', label: 'Heart failure', vol: 300, start: 0.15, end: 0.21, weekend: 2.0 },
  { id: 'copd', label: 'COPD', vol: 260, start: 0.14, end: 0.19, weekend: 2.0 },
  { id: 'pneumonia', label: 'Pneumonia', vol: 380, base: 0.15, end: null, weekend: 1.1 },
  { id: 'hip_knee', label: 'Hip/knee replacement', vol: 340, base: 0.09, end: null, weekend: 1.1 },
  { id: 'diabetes', label: 'Diabetes', vol: 300, base: 0.13, end: null, weekend: 1.1 },
  { id: 'stroke', label: 'Stroke', vol: 220, base: 0.14, end: null, weekend: 1.1 },
];
const EVENING_MULT = 1.05;
const NOISE_SD = 0.02; // relative noise on rate
const RATIO_COUPLING = 0.25; // how strongly nurse_ratio noise moves the rate

// mulberry32: small deterministic PRNG.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);
// Box-Muller standard normal.
function randn() {
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// --- Solve the "other four" so the blended rate is flat across all months ---
const rising = CONDITIONS.filter((c) => c.end !== null);
const others = CONDITIONS.filter((c) => c.end === null);
const volRising = rising.reduce((s, c) => s + c.vol, 0);
const volOthers = others.reduce((s, c) => s + c.vol, 0);
const volAll = volRising + volOthers;
const risingStart = rising.reduce((s, c) => s + c.vol * c.start, 0);
const risingEnd = rising.reduce((s, c) => s + c.vol * c.end, 0);
const othersBaseWeighted = others.reduce((s, c) => s + c.vol * c.base, 0);
// Constant offset k so blended(start) = target.
const k = (TARGET_BLENDED * volAll - risingStart - othersBaseWeighted) / volOthers;
// Common decline d (in rate points) so blended(end) = target as well.
const d = (risingEnd - risingStart) / volOthers;
for (const c of others) {
  c.start = c.base + k;
  c.end = c.start - d;
}

function conditionRate(c, m) {
  return c.start + ((c.end - c.start) * m) / (MONTHS - 1);
}

// Shift weights so the condition's blended rate equals conditionRate().
function shiftMult(c, shift) {
  const raw = { weekday_day: 1, weekday_evening: EVENING_MULT, weekend: c.weekend };
  const norm = SHIFTS.reduce((s, sh) => s + SHIFT_SHARE[sh] * raw[sh], 0);
  return raw[shift] / norm;
}

function monthLabel(m) {
  const y = START_YEAR + Math.floor(m / 12);
  const mo = (m % 12) + 1;
  return `${y}-${String(mo).padStart(2, '0')}`;
}

// --- Generate rows ---
const rows = [];
for (let m = 0; m < MONTHS; m++) {
  for (const c of CONDITIONS) {
    for (const shift of SHIFTS) {
      const discharges = Math.max(
        10,
        Math.round(c.vol * SHIFT_SHARE[shift] * (1 + 0.04 * randn())),
      );
      const ratioNoise = randn();
      const nurse_ratio = +(NURSE_BASE[shift] * (1 + 0.08 * ratioNoise)).toFixed(2);
      const expected =
        conditionRate(c, m) *
        shiftMult(c, shift) *
        (1 + NOISE_SD * randn() + RATIO_COUPLING * ratioNoise * 0.1);
      const readmissions = Math.max(0, Math.min(discharges, Math.round(discharges * expected)));
      rows.push({
        month: monthLabel(m),
        condition: c.id,
        shift,
        discharges,
        readmissions,
        rate: +(readmissions / discharges).toFixed(4),
        nurse_ratio,
      });
    }
  }
}

// --- Sanity checks ---
const sum = (arr, f) => arr.reduce((s, r) => s + f(r), 0);
const blended = (rs) => sum(rs, (r) => r.readmissions) / sum(rs, (r) => r.discharges);
const failures = [];

const monthsList = [...new Set(rows.map((r) => r.month))];
const monthly = monthsList.map((mo) => blended(rows.filter((r) => r.month === mo)));
console.log('Overall blended rate by month:');
monthsList.forEach((mo, i) => console.log(`  ${mo}  ${(monthly[i] * 100).toFixed(2)}%`));
const mean = monthly.reduce((a, b) => a + b, 0) / monthly.length;
const maxDev = Math.max(...monthly.map((x) => Math.abs(x - TARGET_BLENDED)));
console.log(`Mean ${(mean * 100).toFixed(2)}%, max deviation from 14.2%: ${(maxDev * 100).toFixed(2)} pt`);
if (maxDev > 0.004) failures.push('Blended rate drifted more than 0.4 pt from 14.2%');
if (Math.abs(mean - TARGET_BLENDED) > 0.002) failures.push('Mean blended rate is not ~14.2%');

for (const c of rising) {
  const rs = rows.filter((r) => r.condition === c.id);
  const first = blended(rs.filter((r) => r.month === monthsList[0]));
  const last = blended(rs.filter((r) => r.month === monthsList[MONTHS - 1]));
  console.log(`${c.label}: ${(first * 100).toFixed(1)}% -> ${(last * 100).toFixed(1)}%`);
  if (last - first < 0.03) failures.push(`${c.label} does not rise by at least 3 pt`);
}
for (const c of others) {
  const rs = rows.filter((r) => r.condition === c.id);
  const first = blended(rs.filter((r) => r.month === monthsList[0]));
  const last = blended(rs.filter((r) => r.month === monthsList[MONTHS - 1]));
  console.log(`${c.label}: ${(first * 100).toFixed(1)}% -> ${(last * 100).toFixed(1)}%`);
  if (last >= first) failures.push(`${c.label} does not improve`);
}

const hc = rows.filter((r) => r.condition === 'heart_failure' || r.condition === 'copd');
const weekendRate = blended(hc.filter((r) => r.shift === 'weekend'));
const weekdayRate = blended(hc.filter((r) => r.shift !== 'weekend'));
const ratio = weekendRate / weekdayRate;
console.log(`HF+COPD weekend vs weekday: ${(weekendRate * 100).toFixed(1)}% vs ${(weekdayRate * 100).toFixed(1)}% (${ratio.toFixed(2)}x)`);
if (ratio < 1.7 || ratio > 2.3) failures.push('HF/COPD weekend multiple is not ~2x');

const wkdayNurse = sum(rows.filter((r) => r.shift === 'weekday_day'), (r) => r.nurse_ratio) /
  rows.filter((r) => r.shift === 'weekday_day').length;
const wkndNurse = sum(rows.filter((r) => r.shift === 'weekend'), (r) => r.nurse_ratio) /
  rows.filter((r) => r.shift === 'weekend').length;
console.log(`Weekend nurse_ratio is ${(((wkndNurse / wkdayNurse) - 1) * 100).toFixed(0)}% worse than weekday day`);

function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  return { r: sxy / Math.sqrt(sxx * syy), slope: sxy / sxx, mx, my };
}
const rAll = pearson(rows.map((r) => r.nurse_ratio), rows.map((r) => r.rate));
const rHC = pearson(hc.map((r) => r.nurse_ratio), hc.map((r) => r.rate));
console.log(`Correlation nurse_ratio vs rate: all rows r=${rAll.r.toFixed(2)}, HF+COPD rows r=${rHC.r.toFixed(2)}`);
console.log(`HF+COPD pooled slope: ${(rHC.slope * 100).toFixed(2)} pt of rate per +1 patient/nurse`);
if (rHC.r < 0.5) failures.push('HF+COPD nurse_ratio/rate correlation is below 0.5');

// --- Write output ---
const out = join(dirname(fileURLToPath(import.meta.url)), 'readmissions.json');
writeFileSync(out, JSON.stringify(rows, null, 1) + '\n');
console.log(`\nWrote ${rows.length} rows to ${out}`);

if (failures.length) {
  console.error('\nSANITY CHECK FAILED:\n - ' + failures.join('\n - '));
  process.exit(1);
}
console.log('All sanity checks passed.');
