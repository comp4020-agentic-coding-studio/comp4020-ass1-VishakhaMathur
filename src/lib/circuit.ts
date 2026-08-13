// Pure circuit math — no DOM, no sliders, so it can be unit tested directly
// (see spec/assignment-1.test.ts) and reused by the page script that drives
// the actual scene.

// The rule this whole prototype exists to teach: each parallel path is
// another route for current, so the combined resistance is always less than
// (or, with only one path, equal to) the smallest resistance among them.
// An empty branch list means an open circuit — no path at all — hence
// Infinity, which also makes current() return 0 for it without a special case.
export function parallelResistance(resistancesOhms: number[]): number {
  if (resistancesOhms.length === 0) return Infinity;
  const reciprocalSum = resistancesOhms.reduce((sum, r) => sum + 1 / r, 0);
  return 1 / reciprocalSum;
}

export function seriesResistance(resistancesOhms: number[]): number {
  return resistancesOhms.reduce((sum, r) => sum + r, 0);
}

// Ohm's law. voltage / Infinity === 0 in JS, so an open circuit (see above)
// falls out of this with no branching logic.
export function current(voltageVolts: number, resistanceOhms: number): number {
  return voltageVolts / resistanceOhms;
}
